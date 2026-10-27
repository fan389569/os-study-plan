/* 操作系统可视化页面的计算内核
 * 页面里显示的每一个调度结果、周转时间、信号量数值都来自这里。
 * 在浏览器中挂在 window.OSEngine，在 Node 中挂在 globalThis.OSEngine。
 */
(function (global) {
  'use strict';

  function cloneJobs(jobs) {
    return jobs.map(function (j, i) {
      return { id: j.id, arrival: j.arrival, burst: j.burst, order: i };
    });
  }

  function summarize(jobs, segments) {
    var first = {};
    var last = {};
    segments.forEach(function (s) {
      if (first[s.id] === undefined) first[s.id] = s.start;
      last[s.id] = s.end;
    });
    var rows = jobs.map(function (j) {
      var completion = last[j.id];
      var turnaround = completion - j.arrival;
      var waiting = turnaround - j.burst;
      return {
        id: j.id,
        arrival: j.arrival,
        burst: j.burst,
        start: first[j.id],
        completion: completion,
        turnaround: turnaround,
        waiting: waiting,
        weighted: turnaround / j.burst
      };
    });
    var n = rows.length;
    function avg(key) {
      return rows.reduce(function (s, r) { return s + r[key]; }, 0) / n;
    }
    return {
      rows: rows,
      avgTurnaround: avg('turnaround'),
      avgWeighted: avg('weighted'),
      avgWaiting: avg('waiting')
    };
  }

  /* 非抢占式：FCFS / SJF / HRRN */
  function nonPreemptive(jobs, policy) {
    var list = cloneJobs(jobs);
    var t = 0;
    var done = 0;
    var finished = {};
    var segments = [];
    var decisions = [];

    while (done < list.length) {
      var pending = list.filter(function (j) { return !finished[j.id]; });
      var avail = pending.filter(function (j) { return j.arrival <= t; });
      if (!avail.length) {
        t = Math.min.apply(null, pending.map(function (j) { return j.arrival; }));
        continue;
      }

      var chosen;
      var extra = {};
      if (policy === 'fcfs') {
        chosen = avail.slice().sort(function (a, b) {
          return a.arrival - b.arrival || a.order - b.order;
        })[0];
      } else if (policy === 'sjf') {
        chosen = avail.slice().sort(function (a, b) {
          return a.burst - b.burst || a.arrival - b.arrival || a.order - b.order;
        })[0];
      } else if (policy === 'hrrn') {
        var scored = avail.map(function (j) {
          var wait = t - j.arrival;
          return {
            id: j.id,
            burst: j.burst,
            arrival: j.arrival,
            wait: wait,
            ratio: (wait + j.burst) / j.burst,
            order: j.order
          };
        });
        scored.sort(function (a, b) {
          return b.ratio - a.ratio || a.burst - b.burst || a.order - b.order;
        });
        chosen = avail.filter(function (j) { return j.id === scored[0].id; })[0];
        extra.candidates = scored;
      }

      var candidates = avail.map(function (j) {
        return { id: j.id, burst: j.burst, wait: t - j.arrival };
      });
      if (!extra.candidates) {
        candidates.forEach(function (c) { c.rem = c.burst; });
      }

      decisions.push({
        t: t,
        kind: 'schedule',
        chosen: chosen.id,
        candidates: candidates,
        ratios: extra.candidates || null
      });

      segments.push({ id: chosen.id, start: t, end: t + chosen.burst });
      t += chosen.burst;
      finished[chosen.id] = true;
      done += 1;
    }

    var result = { segments: segments, decisions: decisions };
    var m = summarize(list, segments);
    for (var k in m) result[k] = m[k];
    return result;
  }

  function fcfs(jobs) { return nonPreemptive(jobs, 'fcfs'); }
  function sjf(jobs) { return nonPreemptive(jobs, 'sjf'); }
  function hrrn(jobs) { return nonPreemptive(jobs, 'hrrn'); }

  /* 抢占式短作业优先（最短剩余时间优先 SRTF） */
  function srtf(jobs) {
    var list = cloneJobs(jobs);
    var rem = {};
    var finished = {};
    var completed = 0;
    list.forEach(function (j) { rem[j.id] = j.burst; });

    var t = Math.min.apply(null, list.map(function (j) { return j.arrival; }));
    var running = null;
    var lastCompleted = null;
    var segments = [];
    var decisions = [];
    var guard = 0;

    function readyAt(time, includeRunning) {
      return list
        .filter(function (j) {
          return j.arrival <= time && !finished[j.id] && rem[j.id] > 0;
        })
        .map(function (j) { return { id: j.id, rem: rem[j.id], arrival: j.arrival, order: j.order }; })
        .sort(function (a, b) {
          return a.rem - b.rem || a.arrival - b.arrival || a.order - b.order;
        });
    }

    while (completed < list.length && guard < 1000) {
      guard += 1;
      var arrivalsNow = list.filter(function (j) {
        return j.arrival === t && !finished[j.id];
      });
      var runningRemBefore = running ? rem[running] : null;
      var preempted = null;
      var kind = 'run';
      var chosen = running;

      if (!running) {
        var ready = readyAt(t, false);
        if (!ready.length) {
          var future = list.filter(function (j) { return j.arrival > t; });
          if (!future.length) break;
          t = Math.min.apply(null, future.map(function (j) { return j.arrival; }));
          continue;
        }
        chosen = ready[0].id;
      } else {
        var better = arrivalsNow.filter(function (j) {
          return rem[j.id] < rem[running];
        });
        if (better.length) {
          better.sort(function (a, b) {
            return rem[a.id] - rem[b.id] || a.order - b.order;
          });
          preempted = running;
          chosen = better[0].id;
        }
      }

      if (chosen === null) break;
      running = chosen;

      var makeDecision =
        arrivalsNow.length > 0 ||
        lastCompleted !== null ||
        decisions.length === 0;

      if (makeDecision) {
        if (lastCompleted !== null) kind = 'complete';
        else if (preempted !== null) kind = 'preempt';
        else if (arrivalsNow.length > 0) kind = decisions.length === 0 ? 'start' : 'keep';
        else kind = 'start';

        var readyList = readyAt(t, false);
        decisions.push({
          t: t,
          kind: kind,
          completed: lastCompleted,
          arrivals: arrivalsNow.map(function (j) {
            return { id: j.id, rem: rem[j.id], arrival: j.arrival };
          }),
          runningBefore: preempted || (running ? running : null),
          runningRemBefore: runningRemBefore,
          candidates: readyList,
          chosen: chosen,
          preempted: preempted
        });
      }

      lastCompleted = null;

      var futureArr = list
        .filter(function (j) { return j.arrival > t; })
        .map(function (j) { return j.arrival; });
      var nextArr = futureArr.length ? Math.min.apply(null, futureArr) : Infinity;
      var finishAt = t + rem[chosen];
      var end = Math.min(finishAt, nextArr);
      if (end > t) {
        segments.push({ id: chosen, start: t, end: end });
      }
      rem[chosen] -= end - t;
      t = end;

      if (rem[chosen] === 0) {
        finished[chosen] = true;
        completed += 1;
        lastCompleted = chosen;
        running = null;
      }
    }

    if (lastCompleted !== null) {
      decisions.push({
        t: t,
        kind: 'done',
        completed: lastCompleted,
        arrivals: [],
        candidates: [],
        chosen: null,
        preempted: null
      });
    }

    var result = { segments: segments, decisions: decisions };
    var m = summarize(list, segments);
    for (var k in m) result[k] = m[k];
    return result;
  }

  /* 时间片轮转 */
  function rr(jobs, quantum) {
    var list = cloneJobs(jobs);
    var rem = {};
    list.forEach(function (j) { rem[j.id] = j.burst; });
    var sorted = list.slice().sort(function (a, b) {
      return a.arrival - b.arrival || a.order - b.order;
    });

    var t = Math.min.apply(null, list.map(function (j) { return j.arrival; }));
    var queue = [];
    var idx = 0;
    while (idx < sorted.length && sorted[idx].arrival <= t) {
      queue.push(sorted[idx].id);
      idx += 1;
    }

    var segments = [];
    var trace = [];
    var guard = 0;

    while (queue.length && guard < 1000) {
      guard += 1;
      var id = queue.shift();
      var queueBefore = queue.slice();
      var run = Math.min(quantum, rem[id]);
      var start = t;
      var end = t + run;
      rem[id] -= run;
      t = end;

      var arrived = [];
      while (idx < sorted.length && sorted[idx].arrival <= t) {
        arrived.push(sorted[idx].id);
        idx += 1;
      }

      if (rem[id] > 0) queue.push(id);
      arrived.forEach(function (aid) { queue.push(aid); });

      segments.push({ id: id, start: start, end: end });
      trace.push({
        id: id,
        start: start,
        end: end,
        run: run,
        remAfter: rem[id],
        completed: rem[id] === 0,
        queueBefore: queueBefore,
        queueAfter: queue.slice(),
        arrived: arrived,
        quantum: quantum
      });
    }

    var result = { segments: segments, trace: trace };
    var m = summarize(list, segments);
    for (var k in m) result[k] = m[k];
    return result;
  }

  /* ---------- 信号量小模拟器 ---------- */
  function makeSem(init) {
    return { value: init, waiters: [] };
  }

  function semP(sem, pid) {
    sem.value -= 1;
    if (sem.value < 0) {
      sem.waiters.push(pid);
      return { blocked: true, value: sem.value, woke: null };
    }
    return { blocked: false, value: sem.value, woke: null };
  }

  function semV(sem) {
    sem.value += 1;
    var woke = null;
    if (sem.value <= 0) {
      woke = sem.waiters.length ? sem.waiters.shift() : null;
    }
    return { blocked: false, value: sem.value, woke: woke };
  }

  function semRange(init, processCount) {
    return { min: init - processCount, max: init };
  }

  /* ---------- 位示图 ---------- */
  function posToBlock(i, j, n, base) {
    return base === 0 ? n * i + j : n * (i - 1) + j;
  }

  function blockToPos(b, n, base) {
    if (base === 0) {
      return { i: Math.floor(b / n), j: b % n };
    }
    return { i: Math.floor((b - 1) / n) + 1, j: ((b - 1) % n) + 1 };
  }

  function bitmapWords(blocks, n) {
    return Math.ceil(blocks / n);
  }

  var api = {
    fcfs: fcfs,
    sjf: sjf,
    srtf: srtf,
    rr: rr,
    hrrn: hrrn,
    summarize: summarize,
    makeSem: makeSem,
    semP: semP,
    semV: semV,
    semRange: semRange,
    posToBlock: posToBlock,
    blockToPos: blockToPos,
    bitmapWords: bitmapWords
  };

  global.OSEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
