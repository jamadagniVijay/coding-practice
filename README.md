# coding-practice

Personal practice repository — data structures, algorithms, and design notes worked through by hand rather than copied.

[![Last commit](https://img.shields.io/github/last-commit/jamadagniVijay/coding-practice?style=for-the-badge&logo=github&color=0d1117&labelColor=161b22)](https://github.com/jamadagniVijay/coding-practice/commits/main)
[![Commits](https://img.shields.io/github/commit-activity/t/jamadagniVijay/coding-practice?style=for-the-badge&label=commits&color=0d1117&labelColor=161b22)](https://github.com/jamadagniVijay/coding-practice/commits/main)
[![Top language](https://img.shields.io/github/languages/top/jamadagniVijay/coding-practice?style=for-the-badge&color=0d1117&labelColor=161b22)](https://github.com/jamadagniVijay/coding-practice)
[![Repo size](https://img.shields.io/github/repo-size/jamadagniVijay/coding-practice?style=for-the-badge&color=0d1117&labelColor=161b22)](https://github.com/jamadagniVijay/coding-practice)

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=flat-square&logo=markdown&logoColor=white)
![draw.io](https://img.shields.io/badge/draw.io-F08705?style=flat-square&logo=diagramsdotnet&logoColor=white)

> _TODO: replace this line with one sentence on why the repo exists (interview prep / staying sharp on DSA outside of day-job work / exploring healthcare data modelling). This is the line GitHub shows in search results, so it does the most work._

---

## Python flash cards

Click a type to reveal its common methods. Try to recall them first.

<details>
<summary><b>str</b> — immutable, ordered sequence of characters</summary>

```python
s = "hello world"

s[0]              # 'h'          index
s[2:5]            # 'llo'        slice
s[::-1]           # reversed
len(s)            # 11

s.split()         # ['hello', 'world']
"-".join(["a","b"])   # 'a-b'
s.strip()         # trim whitespace (lstrip / rstrip)
s.replace("l","L")
s.find("wor")     # 6, or -1 if absent
s.index("wor")    # 6, raises ValueError if absent
s.count("l")      # 3
s.startswith("he") / s.endswith("ld")
s.upper() / s.lower() / s.title()
s.isdigit() / s.isalpha() / s.isalnum()
```

Strings are immutable — every "change" returns a new string. Building one in a loop with `+=` is O(n²); collect into a list and `"".join(...)` instead.

</details>

<details>
<summary><b>list</b> — mutable, ordered, allows duplicates</summary>

```python
a = [3, 1, 2]

a.append(4)       # add one to the end          O(1)
a.extend([5, 6])  # add many
a.insert(0, 9)    # insert at index             O(n)
a.pop()           # remove & return last        O(1)
a.pop(0)          # remove & return first       O(n)
a.remove(1)       # remove first matching value O(n)

a.sort()                    # in place, returns None
sorted(a, reverse=True)     # new list
a.sort(key=lambda x: -x)    # custom order
a.reverse()
a.index(2)        # first position, ValueError if absent
a.count(2)
2 in a            # membership                  O(n)

[x*2 for x in a if x > 1]   # comprehension
```

</details>

<details>
<summary><b>tuple</b> — immutable, ordered</summary>

```python
t = (1, 2, 3)

t[0]              # index / slice like a list
t.index(2)
t.count(2)
x, y, z = t       # unpacking
```

Only two methods, because it can't be modified. Use it as a `dict` key or `set` member — a `list` can't be, a `tuple` of hashables can.

</details>

<details>
<summary><b>dict</b> — mutable key → value map, insertion-ordered</summary>

```python
d = {"a": 1, "b": 2}

d["a"]            # KeyError if missing
d.get("z")        # None if missing
d.get("z", 0)     # default if missing
d.setdefault("z", []).append(1)

d["c"] = 3
d.pop("a")        # remove & return value
d.popitem()       # remove & return last pair
d.update({"e": 5})

d.keys() / d.values() / d.items()
for k, v in d.items(): ...
"a" in d          # checks KEYS                 O(1)
```

Average O(1) for lookup, insert and delete. Keys must be hashable.

</details>

<details>
<summary><b>set</b> — mutable, unordered, no duplicates</summary>

```python
s = {1, 2, 3}

s.add(4)
s.discard(9)      # no error if absent
s.remove(9)       # KeyError if absent
s.pop()           # removes an arbitrary element

a | b   a.union(b)
a & b   a.intersection(b)
a - b   a.difference(b)
a ^ b   a.symmetric_difference(b)

1 in s            # O(1) — this is the reason to reach for a set
```

`set()` creates an empty set; `{}` creates an empty dict.

</details>

<details>
<summary><b>int / float</b> — numbers</summary>

```python
7 / 2             # 3.5   true division
7 // 2            # 3     floor division
-7 // 2           # -4    floors toward -infinity
7 % 3             # 1
divmod(7, 3)      # (2, 1)
2 ** 10           # 1024
abs(-5)
round(2.675, 2)
int("42") / float("3.14") / str(42)
int("1010", 2)    # 10   parse binary
bin(10) / hex(255) / oct(8)
float('inf') / float('-inf')
```

`int` has unbounded precision — no overflow to worry about.

</details>

<details>
<summary><b>collections</b> & <b>heapq</b> — the DSA workhorses</summary>

```python
from collections import deque, Counter, defaultdict
import heapq

q = deque([1, 2, 3])
q.append(4); q.appendleft(0)      # O(1) both ends
q.pop();     q.popleft()          # O(1) both ends

c = Counter("aabbbc")             # {'b':3, 'a':2, 'c':1}
c.most_common(2)                  # [('b',3), ('a',2)]

g = defaultdict(list)
g[1].append(2)                    # no KeyError on first touch

h = [3, 1, 2]
heapq.heapify(h)                  # min-heap, in place
heapq.heappush(h, 0)
heapq.heappop(h)                  # smallest
heapq.nlargest(2, h)
```

Python only ships a min-heap. For a max-heap, push negated values.

</details>

---

## Layout

| Path | Contents |
| :--- | :--- |
| `Health-DSA/` | _TODO: what's in here — language, topic breakdown_ |
| `python_code/` | _TODO: what's in here — scripts, exercises, source_ |
| `diagrams/` | Design and architecture diagrams |
| `ES2027.drawio` | draw.io source for a diagram — _TODO: what it models_ |
| `sub-array-sum.md` | Write-up of the subarray-sum problem |

## How the solutions are written

_TODO: one short paragraph. A few things worth stating if they're true:_

- _Language(s) and version(s)_
- _Whether each solution carries a complexity note_
- _Whether there are tests, and how to run them_
- _Naming/file convention, if there is one_

## Running the code

```bash
git clone https://github.com/jamadagniVijay/coding-practice.git
cd coding-practice
```

_TODO: add the actual run command, e.g._

```bash
python python_code/<file>.py
```

## Notes

Problem write-ups are kept as Markdown next to the code — see `sub-array-sum.md` for the format: problem statement, approach, complexity.

_TODO: confirm that's actually the format used, or replace with what is._

## Viewing the diagrams

`.drawio` files open at [app.diagrams.net](https://app.diagrams.net) or via the draw.io extension in VS Code.

---

## Working principles

<table>
<tr><td>

### The 3 Cs

**Completeness · Correctness · Clearness**

</td></tr>
</table>

**People will question you**
> If I can't count on you for efforts, how can I count on you for results.

**My identity**
> Standards → are about what you say "YES" to such as — Values, effort, character.
> Walls → should I have walls for this.
> ಈ ತರ ಇದ್ರೆ ಚೆನ್ನಾಗಿರುತ್ತಾ, ಈ ಸ್ಥಿತಿಯಲ್ಲಿ ನಾನು ಗೌರವ ಉಳಿಸಿಕೊಳ್ಳಬಹುದಾ?

**Don't expect from yourself and from others**
> ನಾನು ಈ ತರ ಇಲ್ವಲ್ಲ ಅಂತ ಯೋಚನೆ ಮಾಡೋ ಬದಲು, ಆ thought na stop ಮಾಡಬೇಕು.
> Screw emotions (Maintain my Standards). I will do this always.

**Difficult conversations**
> Difficult conversations are for completeness. A difficult conversation is a place where Honesty (give clear facts) meets Empathy (make the person feel safe vs being nice).

**Every 30 mins — remind myself**
> See the next 3 things to do → should I have lunch → Create an insurance card.

**Procrastination**
> Ties to a coping mechanism → makes my mind feel safe but affects my effort towards completeness.

**The 5 second rule**
> Send a meeting request to the person needing time. Wait for 5 seconds before responding to messages / sending messages.

**True thoughts**
> Thoughts that are there for at least more than 2 minutes → ties to the 5 second rule.

**Integrity maintenance → Anticipation**
> Skill + patience + effort + strength = integrity.

**Coping mechanisms**
> Sleep at 9 PM daily — it starts with this discipline.

**Known = do it now  ||  Not known = understand (more and more) and do it now**
> It's easier to face the fear than wait.

**Read between the lines**

---

This is a personal practice repo, not a library. No releases, no packaging, no contribution process.
