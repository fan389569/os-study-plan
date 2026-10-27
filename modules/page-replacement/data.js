window.LESSON = {
 "seq": [
  2,
  3,
  2,
  1,
  5,
  2,
  4,
  5,
  3,
  2
 ],
 "frames": 3,
 "algo": {
  "FIFO": {
   "cols": [
    {
     "t": 1,
     "page": 2,
     "frames": [
      2,
      null,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 0,
     "meters": [
      0,
      null,
      null
     ],
     "loaded": [
      1,
      0,
      0
     ],
     "used": [
      1,
      0,
      0
     ],
     "faults": 1
    },
    {
     "t": 2,
     "page": 3,
     "frames": [
      2,
      3,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 1,
     "meters": [
      1,
      0,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      1,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 3,
     "page": 2,
     "frames": [
      2,
      3,
      null
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      2,
      1,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      3,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 4,
     "page": 1,
     "frames": [
      2,
      3,
      1
     ],
     "status": "miss",
     "evicted": null,
     "target": 2,
     "meters": [
      3,
      2,
      0
     ],
     "loaded": [
      1,
      2,
      4
     ],
     "used": [
      3,
      2,
      4
     ],
     "faults": 3
    },
    {
     "t": 5,
     "page": 5,
     "frames": [
      5,
      3,
      1
     ],
     "status": "miss",
     "evicted": 2,
     "target": 0,
     "meters": [
      0,
      3,
      1
     ],
     "loaded": [
      5,
      2,
      4
     ],
     "used": [
      5,
      2,
      4
     ],
     "faults": 4
    },
    {
     "t": 6,
     "page": 2,
     "frames": [
      5,
      2,
      1
     ],
     "status": "miss",
     "evicted": 3,
     "target": 1,
     "meters": [
      1,
      0,
      2
     ],
     "loaded": [
      5,
      6,
      4
     ],
     "used": [
      5,
      6,
      4
     ],
     "faults": 5
    },
    {
     "t": 7,
     "page": 4,
     "frames": [
      5,
      2,
      4
     ],
     "status": "miss",
     "evicted": 1,
     "target": 2,
     "meters": [
      2,
      1,
      0
     ],
     "loaded": [
      5,
      6,
      7
     ],
     "used": [
      5,
      6,
      7
     ],
     "faults": 6
    },
    {
     "t": 8,
     "page": 5,
     "frames": [
      5,
      2,
      4
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      3,
      2,
      1
     ],
     "loaded": [
      5,
      6,
      7
     ],
     "used": [
      8,
      6,
      7
     ],
     "faults": 6
    },
    {
     "t": 9,
     "page": 3,
     "frames": [
      3,
      2,
      4
     ],
     "status": "miss",
     "evicted": 5,
     "target": 0,
     "meters": [
      0,
      3,
      2
     ],
     "loaded": [
      9,
      6,
      7
     ],
     "used": [
      9,
      6,
      7
     ],
     "faults": 7
    },
    {
     "t": 10,
     "page": 2,
     "frames": [
      3,
      2,
      4
     ],
     "status": "hit",
     "evicted": null,
     "target": 1,
     "meters": [
      1,
      4,
      3
     ],
     "loaded": [
      9,
      6,
      7
     ],
     "used": [
      9,
      10,
      7
     ],
     "faults": 7
    }
   ],
   "faults": 7
  },
  "LRU": {
   "cols": [
    {
     "t": 1,
     "page": 2,
     "frames": [
      2,
      null,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 0,
     "meters": [
      0,
      null,
      null
     ],
     "loaded": [
      1,
      0,
      0
     ],
     "used": [
      1,
      0,
      0
     ],
     "faults": 1
    },
    {
     "t": 2,
     "page": 3,
     "frames": [
      2,
      3,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 1,
     "meters": [
      1,
      0,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      1,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 3,
     "page": 2,
     "frames": [
      2,
      3,
      null
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      0,
      1,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      3,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 4,
     "page": 1,
     "frames": [
      2,
      3,
      1
     ],
     "status": "miss",
     "evicted": null,
     "target": 2,
     "meters": [
      1,
      2,
      0
     ],
     "loaded": [
      1,
      2,
      4
     ],
     "used": [
      3,
      2,
      4
     ],
     "faults": 3
    },
    {
     "t": 5,
     "page": 5,
     "frames": [
      2,
      5,
      1
     ],
     "status": "miss",
     "evicted": 3,
     "target": 1,
     "meters": [
      2,
      0,
      1
     ],
     "loaded": [
      1,
      5,
      4
     ],
     "used": [
      3,
      5,
      4
     ],
     "faults": 4
    },
    {
     "t": 6,
     "page": 2,
     "frames": [
      2,
      5,
      1
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      0,
      1,
      2
     ],
     "loaded": [
      1,
      5,
      4
     ],
     "used": [
      6,
      5,
      4
     ],
     "faults": 4
    },
    {
     "t": 7,
     "page": 4,
     "frames": [
      2,
      5,
      4
     ],
     "status": "miss",
     "evicted": 1,
     "target": 2,
     "meters": [
      1,
      2,
      0
     ],
     "loaded": [
      1,
      5,
      7
     ],
     "used": [
      6,
      5,
      7
     ],
     "faults": 5
    },
    {
     "t": 8,
     "page": 5,
     "frames": [
      2,
      5,
      4
     ],
     "status": "hit",
     "evicted": null,
     "target": 1,
     "meters": [
      2,
      0,
      1
     ],
     "loaded": [
      1,
      5,
      7
     ],
     "used": [
      6,
      8,
      7
     ],
     "faults": 5
    },
    {
     "t": 9,
     "page": 3,
     "frames": [
      3,
      5,
      4
     ],
     "status": "miss",
     "evicted": 2,
     "target": 0,
     "meters": [
      0,
      1,
      2
     ],
     "loaded": [
      9,
      5,
      7
     ],
     "used": [
      9,
      8,
      7
     ],
     "faults": 6
    },
    {
     "t": 10,
     "page": 2,
     "frames": [
      3,
      5,
      2
     ],
     "status": "miss",
     "evicted": 4,
     "target": 2,
     "meters": [
      1,
      2,
      0
     ],
     "loaded": [
      9,
      5,
      10
     ],
     "used": [
      9,
      8,
      10
     ],
     "faults": 7
    }
   ],
   "faults": 7
  },
  "OPT": {
   "cols": [
    {
     "t": 1,
     "page": 2,
     "frames": [
      2,
      null,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 0,
     "meters": [
      2,
      null,
      null
     ],
     "loaded": [
      1,
      0,
      0
     ],
     "used": [
      1,
      0,
      0
     ],
     "faults": 1
    },
    {
     "t": 2,
     "page": 3,
     "frames": [
      2,
      3,
      null
     ],
     "status": "miss",
     "evicted": null,
     "target": 1,
     "meters": [
      1,
      7,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      1,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 3,
     "page": 2,
     "frames": [
      2,
      3,
      null
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      3,
      6,
      null
     ],
     "loaded": [
      1,
      2,
      0
     ],
     "used": [
      3,
      2,
      0
     ],
     "faults": 2
    },
    {
     "t": 4,
     "page": 1,
     "frames": [
      2,
      3,
      1
     ],
     "status": "miss",
     "evicted": null,
     "target": 2,
     "meters": [
      2,
      5,
      1000000000
     ],
     "loaded": [
      1,
      2,
      4
     ],
     "used": [
      3,
      2,
      4
     ],
     "faults": 3
    },
    {
     "t": 5,
     "page": 5,
     "frames": [
      2,
      3,
      5
     ],
     "status": "miss",
     "evicted": 1,
     "target": 2,
     "meters": [
      1,
      4,
      3
     ],
     "loaded": [
      1,
      2,
      5
     ],
     "used": [
      3,
      2,
      5
     ],
     "faults": 4
    },
    {
     "t": 6,
     "page": 2,
     "frames": [
      2,
      3,
      5
     ],
     "status": "hit",
     "evicted": null,
     "target": 0,
     "meters": [
      4,
      3,
      2
     ],
     "loaded": [
      1,
      2,
      5
     ],
     "used": [
      6,
      2,
      5
     ],
     "faults": 4
    },
    {
     "t": 7,
     "page": 4,
     "frames": [
      4,
      3,
      5
     ],
     "status": "miss",
     "evicted": 2,
     "target": 0,
     "meters": [
      1000000000,
      2,
      1
     ],
     "loaded": [
      7,
      2,
      5
     ],
     "used": [
      7,
      2,
      5
     ],
     "faults": 5
    },
    {
     "t": 8,
     "page": 5,
     "frames": [
      4,
      3,
      5
     ],
     "status": "hit",
     "evicted": null,
     "target": 2,
     "meters": [
      1000000000,
      1,
      1000000000
     ],
     "loaded": [
      7,
      2,
      5
     ],
     "used": [
      7,
      2,
      8
     ],
     "faults": 5
    },
    {
     "t": 9,
     "page": 3,
     "frames": [
      4,
      3,
      5
     ],
     "status": "hit",
     "evicted": null,
     "target": 1,
     "meters": [
      1000000000,
      1000000000,
      1000000000
     ],
     "loaded": [
      7,
      2,
      5
     ],
     "used": [
      7,
      9,
      8
     ],
     "faults": 5
    },
    {
     "t": 10,
     "page": 2,
     "frames": [
      2,
      3,
      5
     ],
     "status": "miss",
     "evicted": 4,
     "target": 0,
     "meters": [
      1000000000,
      1000000000,
      1000000000
     ],
     "loaded": [
      10,
      2,
      5
     ],
     "used": [
      10,
      9,
      8
     ],
     "faults": 6
    }
   ],
   "faults": 6
  }
 }
};
