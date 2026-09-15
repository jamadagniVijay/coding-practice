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

## Patterns worth knowing cold

Three idioms that come up constantly. Each one has a failure mode that only bites in edge cases.

### `setdefault` — group items under a key

```python
patients_on_same_coverage.setdefault(key, []).append(member["member_id"])
```

One line doing two jobs: if `key` is absent, insert it with an empty list; either way, return the list so it can be appended to. Without it you write three lines and a branch:

```python
if key not in patients_on_same_coverage:
    patients_on_same_coverage[key] = []
patients_on_same_coverage[key].append(member["member_id"])
```

**The trap:** the default is evaluated on *every* call, even when the key already exists. So a fresh `[]` is built and thrown away on each hit. Harmless for a list literal, expensive if the default is a function call.

**The alternative:**

```python
from collections import defaultdict
patients_on_same_coverage = defaultdict(list)
patients_on_same_coverage[key].append(member["member_id"])
```

Cleaner in a loop, and no wasted default. The tradeoff is that a `defaultdict` silently creates entries on *read* too — `if x in d` is safe, but a bare `d[missing]` inserts `missing` rather than raising `KeyError`. Use `setdefault` when you want a plain `dict` that still errors on a genuine typo; use `defaultdict` when grouping is all the dict does.

### `.strip()` — trim the edges

```python
s.strip()        # both ends
s.lstrip()       # left only
s.rstrip()       # right only
s.strip("\n\t ")  # strip these characters
```

With no argument it removes whitespace — spaces, tabs, newlines, carriage returns — from both ends and stops at the first character that isn't whitespace. The middle is never touched: `"  a b  ".strip()` is `"a b"`.

**The trap:** the argument is a *set of characters*, not a prefix. `"card_id".strip("card")` is `"_id"` — it chewed through `c`, `a`, `r`, `d` in any order. To remove a genuine prefix or suffix, use `removeprefix()` / `removesuffix()` (3.9+).

**Why it matters here:** anything parsed out of a file, a form field, or an OCR pass carries invisible edge whitespace. `"12345 " == "12345"` is `False`, and `" 12345".isdigit()` is `False`. Strip at the boundary, once, as the value enters the system — not scattered at every comparison.

### Fixed-size sliding window

```python
for reading in range(len(readings) - k + 1):
    window = readings[reading:reading + k]
```

`reading` is the *start index* of each window. The bound `len(readings) - k + 1` is what stops the last window from running off the end: with 10 readings and `k = 3`, starts run `0..7`, and the final window covers indices `7, 8, 9`.

**Pseudo code:**

```
function fixed_window(readings, k):
    if k <= 0 or k > len(readings):
        return nothing          # guard: no valid window exists

    window_sum = sum of readings[0 .. k-1]    # build the first window
    best       = window_sum

    for start in 1 .. len(readings) - k:      # slide one step at a time
        window_sum = window_sum
                   - readings[start - 1]      # element leaving on the left
                   + readings[start + k - 1]  # element entering on the right
        best = max(best, window_sum)

    return best
```

**The tradeoff:** re-slicing `readings[i:i+k]` inside the loop is O(k) per step, so the whole scan is O(n·k) and allocates a new list each iteration. Rolling the sum — subtract the departing element, add the arriving one — makes each step O(1) and the scan O(n) with no extra allocation. Slicing is fine while you're establishing correctness and `k` is small; switch to the rolling form once the window or the input grows.

**The trap:** off-by-one. `range(len(readings) - k)` drops the final window; `range(len(readings))` runs past the end and silently yields short windows, because Python slices don't raise on an over-long stop. Neither mistake throws — both just return a quietly wrong answer. Test with `k == 1` and `k == len(readings)`.

---

## Python flash cards

<div align="center">

**Click any card to flip it.** Recall the methods first, then check yourself.

</div>

<table>
<tr>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/str-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="str"><br><sub><i>immutable &middot; ordered &middot; characters</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
s = "hello world"

s[2:5]        # 'llo'   slice
s[::-1]       # reversed
s.split()     # ['hello','world']
"-".join(x)   # build a string
s.strip()     # lstrip / rstrip
s.replace(a, b)
s.find(t)     # -1 if absent
s.index(t)    # raises if absent
s.count("l")
s.startswith / s.endswith
s.upper / s.lower / s.title
s.isdigit / s.isalpha / s.isalnum
</pre>
<b>Trap:</b> immutable. Building with <code>+=</code> in a loop is O(n&sup2;) &mdash; collect into a list and <code>join</code>.
</details>
</td>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/list-2E8B57?style=for-the-badge&logo=python&logoColor=white" alt="list"><br><sub><i>mutable &middot; ordered &middot; duplicates ok</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
a = [3, 1, 2]

a.append(4)     # end          O(1)
a.extend([5,6])
a.insert(0, 9)  #              O(n)
a.pop()         # last         O(1)
a.pop(0)        # first        O(n)
a.remove(1)     # by value     O(n)
a.sort()        # in place, returns None
sorted(a, key=..., reverse=True)
a.reverse()
a.index(2) / a.count(2)
2 in a          #              O(n)
[x*2 for x in a if x &gt; 1]
</pre>
<b>Trap:</b> <code>sort()</code> returns <code>None</code>. <code>b = a.sort()</code> gives you nothing.
</details>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/tuple-6A4C93?style=for-the-badge&logo=python&logoColor=white" alt="tuple"><br><sub><i>immutable &middot; ordered &middot; hashable</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
t = (1, 2, 3)

t[0]          # index / slice
t.index(2)
t.count(2)
x, y, z = t   # unpacking

# only two methods &mdash;
# nothing can be modified
</pre>
<b>Why it matters:</b> a tuple of hashables can be a <code>dict</code> key or <code>set</code> member. A list cannot.
</details>
</td>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/dict-E07B39?style=for-the-badge&logo=python&logoColor=white" alt="dict"><br><sub><i>key &rarr; value &middot; insertion-ordered</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
d = {"a": 1, "b": 2}

d["a"]              # KeyError if missing
d.get("z")          # None if missing
d.get("z", 0)       # default
d.setdefault("z", []).append(1)
d.pop("a")
d.popitem()         # last pair
d.update({"e": 5})
d.keys() / d.values() / d.items()
for k, v in d.items(): ...
"a" in d            # checks KEYS   O(1)
</pre>
<b>Trap:</b> <code>in</code> tests keys, never values. Keys must be hashable.
</details>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/set-158F8F?style=for-the-badge&logo=python&logoColor=white" alt="set"><br><sub><i>unordered &middot; unique &middot; O(1) lookup</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
s = {1, 2, 3}

s.add(4)
s.discard(9)   # silent if absent
s.remove(9)    # KeyError if absent
s.pop()        # arbitrary element

a | b   a.union(b)
a &amp; b   a.intersection(b)
a - b   a.difference(b)
a ^ b   a.symmetric_difference(b)

1 in s         #               O(1)
</pre>
<b>Trap:</b> <code>{}</code> is an empty dict. Use <code>set()</code> for an empty set.
</details>
</td>
<td width="50%" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/int%20%2F%20float-B5314C?style=for-the-badge&logo=python&logoColor=white" alt="int / float"><br><sub><i>unbounded ints &middot; no overflow</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
7 / 2        # 3.5   true division
7 // 2       # 3     floor
-7 // 2      # -4    floors toward -inf
7 % 3        # 1
divmod(7, 3) # (2, 1)
2 ** 10
abs(-5) / round(2.675, 2)
int("42") / float("3.14") / str(42)
int("1010", 2)   # 10   parse binary
bin / hex / oct
float('inf') / float('-inf')
</pre>
<b>Trap:</b> <code>//</code> floors toward negative infinity, so <code>-7 // 2</code> is <code>-4</code>, not <code>-3</code>.
</details>
</td>
</tr>
<tr>
<td colspan="2" valign="top">
<details>
<summary><img src="https://img.shields.io/badge/collections%20%2B%20heapq-4A5568?style=for-the-badge&logo=python&logoColor=white" alt="collections and heapq"><br><sub><i>the DSA workhorses</i></sub><br><sub>click to flip</sub></summary>
<br>
<pre>
from collections import deque, Counter, defaultdict
import heapq

q = deque([1, 2, 3])
q.append(4);  q.appendleft(0)     # O(1) both ends
q.pop();      q.popleft()         # O(1) both ends

c = Counter("aabbbc")             # {'b':3, 'a':2, 'c':1}
c.most_common(2)                  # [('b',3), ('a',2)]

g = defaultdict(list)
g[1].append(2)                    # no KeyError on first touch

h = [3, 1, 2]
heapq.heapify(h)                  # min-heap, in place
heapq.heappush(h, 0)
heapq.heappop(h)                  # smallest
heapq.nlargest(2, h)
</pre>
<b>Trap:</b> Python ships only a min-heap. For a max-heap, push negated values.
</details>
</td>
</tr>
</table>

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