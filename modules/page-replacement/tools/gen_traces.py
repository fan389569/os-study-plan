# -*- coding: utf-8 -*-
"""页面置换算法模拟 + 例题筛选。
输出 data.js（直接以内联 JS 字面量嵌入，避免 file:// 下 fetch 被拦）。
"""
import json
import random
import sys

INF = 10 ** 9


def simulate(seq, n, algo):
    """返回 (columns, faults)。seq 为 int 列表。"""
    frames = [None] * n
    loaded = [0] * n      # 装入时刻（1-based）
    used = [0] * n        # 最后一次使用时刻
    q = []                # FIFO：按装入先后排列的块号
    cols = []
    faults = 0

    for i, p in enumerate(seq):
        t = i + 1
        if p in frames:
            idx = frames.index(p)
            status = "hit"
            used[idx] = t
            evicted = None
            target = idx
        else:
            faults += 1
            status = "miss"
            evicted = None
            if None in frames:
                idx = frames.index(None)
            else:
                if algo == "FIFO":
                    idx = q[0]
                elif algo == "LRU":
                    idx = min(range(n), key=lambda k: used[k])
                else:  # OPT
                    best, bestdist = None, -1
                    for k, f in enumerate(frames):
                        try:
                            nxt = seq.index(f, i + 1)
                            dist = nxt - i
                        except ValueError:
                            dist = INF
                        if dist > bestdist:
                            bestdist, best = dist, k
                    idx = best
                evicted = frames[idx]
                if algo == "FIFO":
                    q.remove(idx)
            frames[idx] = p
            loaded[idx] = t
            used[idx] = t
            target = idx
            if algo == "FIFO":
                q.append(idx)

        # 本列展示用的三根“条”
        if algo == "FIFO":
            meters = [t - loaded[k] if frames[k] is not None else None for k in range(n)]
        elif algo == "LRU":
            meters = [t - used[k] if frames[k] is not None else None for k in range(n)]
        else:
            meters = []
            for k in range(n):
                if frames[k] is None:
                    meters.append(None)
                else:
                    try:
                        nxt = seq.index(frames[k], i + 1)
                        meters.append(nxt - i)
                    except ValueError:
                        meters.append(INF)

        cols.append({
            "t": t,
            "page": p,
            "frames": list(frames),
            "status": status,
            "evicted": evicted,
            "target": target,
            "meters": meters,
            "loaded": list(loaded),
            "used": list(used),
            "faults": faults,
        })

    return cols, faults


def hits_of(cols):
    return sum(1 for c in cols if c["status"] == "hit")


def analyze(seq, n=3):
    out = {}
    for a in ("FIFO", "LRU", "OPT"):
        cols, f = simulate(seq, n, a)
        out[a] = {
            "cols": cols,
            "faults": f,
            "hits": len(seq) - f,
            "evict_path": [c["evicted"] for c in cols],
        }
    return out


def divergence(res):
    """返回第一个 FIFO 与 LRU 淘汰页不同的列下标，没有则 None。"""
    n = min(len(res["FIFO"]["evict_path"]), len(res["LRU"]["evict_path"]))
    for i in range(n):
        a, b = res["FIFO"]["evict_path"][i], res["LRU"]["evict_path"][i]
        if a is not None and b is not None and a != b:
            return i
    return None


def main():
    # 1) 核实用户笔记里的序列
    user_seq = [2, 3, 2, 1, 5, 2, 4, 5, 3, 2]
    r = analyze(user_seq)
    print("== 用户笔记序列", user_seq, "3 块 ==")
    for a in ("FIFO", "LRU", "OPT"):
        print(f"  {a}: 缺页 {r[a]['faults']}  命中 {r[a]['hits']}")
    print()

    # 2) 搜索教学序列
    random.seed(20261025)
    cands = []
    for _ in range(400000):
        L = random.choice([10, 11, 12])
        alpha = random.choice([4, 5])
        seq = [random.randint(1, alpha) for _ in range(L)]
        if len(set(seq)) < 4:
            continue
        if any(seq[i] == seq[i + 1] for i in range(L - 1)):
            continue
        res = analyze(seq)
        f, l, o = res["FIFO"]["faults"], res["LRU"]["faults"], res["OPT"]["faults"]
        if not (o < l < f):
            continue
        div = divergence(res)
        if div is None:
            continue
        if res["FIFO"]["hits"] < 3 or res["LRU"]["hits"] < 3 or res["OPT"]["hits"] < 4:
            continue
        # 分差要明显，且最好开头不要立刻满
        if f - o < 3:
            continue
        cands.append((f - o, f - l, -len(seq), seq, res))

    cands.sort(reverse=True, key=lambda x: (x[0], x[1]))
    print(f"candidates: {len(cands)}")
    for c in cands[:10]:
        seq = c[3]
        print(c[0], c[1], len(seq), seq,
              "F/L/O=", c[4]["FIFO"]["faults"], c[4]["LRU"]["faults"], c[4]["OPT"]["faults"],
              "div@", divergence(c[4]) + 1)

    if len(sys.argv) > 1:
        seq = [int(x) for x in sys.argv[1].split(",")]
        res = analyze(seq)
        print("\n== chosen", seq)
        for a in ("FIFO", "LRU", "OPT"):
            print(a, "faults", res[a]["faults"])
            for c in res[a]["cols"]:
                print("  t%-2d p=%d %-4s frames=%s ev=%s meters=%s" % (
                    c["t"], c["page"], c["status"], c["frames"], c["evicted"], c["meters"]))
        with open("E:/projects/os-page-replacement/data.js", "w", encoding="utf-8") as fp:
            fp.write("window.LESSON = ")
            json.dump({"seq": seq, "frames": 3,
                       "algo": {a: {"cols": res[a]["cols"], "faults": res[a]["faults"]}
                                for a in ("FIFO", "LRU", "OPT")}},
                      fp, ensure_ascii=False, indent=1)
            fp.write(";\n")
        print("wrote data.js")


if __name__ == "__main__":
    main()
