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