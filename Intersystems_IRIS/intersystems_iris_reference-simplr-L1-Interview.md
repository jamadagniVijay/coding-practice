# InterSystems IRIS & Caché ObjectScript (COS) Technical Reference Manual

**Interviewer:** Rathinakumar Subramani

**Company:** Simplr

---

## 1. Cross-Namespace Extended References

InterSystems IRIS provides syntactic qualifiers to read/write data and execute routines residing in namespaces outside the current active process context.

### Cross-Namespace Globals
- **Bracket Syntax:** `WRITE ^[namespace2]Global2(index)` maps execution explicitly to the target database file.
- **Pipe Syntax:** `SET value = ^| "SAMPLES" |MyGlobal(1)` accesses the global within the target environment.
- **Variable Substitution:** 
  ```objectscript
  SET ns = "SAMPLES"
  SET ^|ns|MyGlobal(3) = "Dynamic Access"
  ```

### Cross-Namespace Routines
- **Explicit Label Execution:** `DO label^|namespace|routine` triggers execution directly inside the distant workspace environment.

---

## 2. Infrastructure: Journaling, Namespaces, & Databases

### Definitions
- **Namespace:** A logical workspace (analogous to a schema or project sandbox) presenting a unified view of code and data engine tables.
- **Database:** The physical underlying storage file (`IRIS.DAT`) resident on the disk structure.

### Journaling Engine
Journaling is a built-in mechanism in InterSystems IRIS that maintains a continuous, time-sequenced log of all database updates (such as `SET` and `KILL` operations on globals).

- **How it Works:** Whenever data changes in a journaled database, IRIS writes those updates to a set of sequential journal files (typically named `YYYYMMDD.nnn` in your journal directory).
- **Purpose:** It provides disaster recovery and data integrity. If a system crashes or data is lost, you can combine a physical database backup with subsequent journal files to perform a "roll-forward" recovery, bringing the database up to a specific point in time. It also helps roll back incomplete transactions.
- **Scope:** **Journaling is a property of the entire database, not individual globals.**

---

## 3. Database Indexes & Query Plan Tuning

### Built-In Indexing Formats
Declare these properties utilizing the `Type` keyword inside your persistent structural definitions:

- **Standard Indexes (`Type = index`):** The default index type. It is a persistent cross-index array that maps indexed property values directly to the corresponding RowID values of the rows.
- **Bitmap Indexes (`Type = bitmap`):** Uses a compressed series of bitstrings to represent the set of RowID values matching a specific indexed value. Best suited for low-cardinality fields (fields with a small number of unique values). *Note: Cannot be a unique index.*
- **Bitslice Indexes (`Type = bitslice`):** A specialized index structure designed for rapid evaluation of mathematical and range conditions (such as sums, minimums, maximums, and numeric comparisons).
- **Collated Key Indexes (`Type = collatedkey`):** An index built on a property using a specific custom or defined collation sequence for that property.
- **Columnar Indexes (`Type = columnar`):** An index structure geared toward columnar storage and query execution paradigms in IRIS.
- **Custom / Functional Indexes:** Developers can implement custom index types by creating a class that implements the `%Library.FunctionalIndex` interface (often used for specialized tools like iFind text indexing).
- **Extent Indexes:** Automatically tracks which objects belong to a specific class within a multi-class extent.

### Table Optimization & Cost-Based Optimizer (CBO) Tuning
- **Add Standard Indexes on Where/Join Fields:** Ensure fields frequently used in WHERE clauses, JOIN conditions, and ORDER BY statements are indexed.
- **Leverage Bitmap Indexes for Low-Cardinality:** For fields with few unique values (e.g., Status, Gender, Region), use Type = bitmap. They drastically speed up AND/OR operations and use minimal disk space.
- **Use Bitslice Indexes for Aggregates:** If you frequently run SUM, AVG, MIN, or MAX on a numeric field, add a Type = bitslice index to compute these instantly without reading the rows.
- **Implement Columnar Indexes for Analytics:** If your queries scan millions of rows to aggregate data, define a columnar index on those columns to read data in bulk.
- **Run Tune Table:** InterSystems IRIS relies on a Cost-Based Optimizer (CBO) to choose the fastest query plan. If your data grew rapidly, the optimizer might be using outdated metrics. Always run Tune Table after loading large datasets. This analyzes your data distribution, selectivity, and average field sizes so the optimizer can make smart choices.
- **Run via SQL / ObjectScript:** `RENAME TABLE my_table ...` or use the management portal / `%SYSTEM.SQL.TuneTable()`.

---

## 4. SQL Execution Paradigms: Embedded vs. Dynamic

| Feature | Embedded SQL (`&sql(...)`) | Dynamic SQL (`%SQL.Statement`) |
| :--- | :--- | :--- |
| **Performance** | **Faster initial execution** (no runtime compilation or parsing). | Slightly slower first execution (requires a runtime Prepare step). |
| **Flexibility** | Rigid; query structure cannot change at runtime. | **Highly flexible**; can build strings dynamically based on user input. |
| **Error Checking** | Syntax checked at compile time. | Syntax checked at runtime. |
| **Output Handling**| Assigns results directly to local ObjectScript variables. | Returns a result set object (`%SQL.StatementResult`) to loop through. |
| **Plan Caching** | Optimal plan generated during compilation. | Relies on the Dynamic SQL Cached Queries mechanism. |

---

## 5. Structural Interrogation & Deep Global Traversal

### `$DATA` Return Values
The `$DATA` function evaluates the structural state of a global or local variable node:
- **`0`:** The node is completely undefined (has no value and no sub-nodes/children).
- **`1`:** The node has a data value, but no sub-nodes (it is a leaf).
- **`10`:** The node has no data value of its own, but it has sub-nodes (it is a pointer/structural branch).
- **`11`:** The node has both a data value and down-level sub-nodes.

### Depth-First Navigation with `$QUERY`
In InterSystems IRIS and Caché ObjectScript, `$QUERY` (often abbreviated as `$Q`) is a built-in system function used to navigate globals in physical order (depth-first traversal). While it looks similar to `$ORDER`, `$QUERY` is fundamentally different because it does not just look at the next value on the same subscript level—it dives deep into child nodes and moves to completely different subscript branches automatically, always returning the full global string reference and its subscripts.

```objectscript
Set node = "^Data"
For {
    // Get the next physical node name
    Set node = $QUERY(@node)
    
    // If no more nodes exist, loop terminates
    Quit:node="" 
    
    // Print the global node name and its actual value
    Write "Node: ", node, " => Value: ", @node, !
}
```

### Navigational Mechanics: `$ZORDER` vs. `$ZREFERENCE`

| Feature | `$ZORDER` (`$ZO`) | `$ZREFERENCE` (`$ZR`) |
| :--- | :--- | :--- |
| **Type** | Function (requires an argument) | Special System Variable (Read-only) |
| **Purpose** | Navigates to next physical node | Remembers the last accessed node |
| **Direction** | Moves depth-first (multi-level) | Static bookmark (single point) |
| **Return Value** | Full name & subscripts of NEXT | Full name & subscripts of LAST |
| **Main Use** | Sequential global traversal/dump | Naked references & error tracing |

---

## 6. System Migration: MUMPS vs. Caché ObjectScript (COS)

Caché ObjectScript (COS) is a direct superset of ANSI MUMPS (M). While MUMPS provides the foundational procedural logic and multidimensional global storage architecture, COS/IRIS expands upon it by introducing full object-oriented architectures, modern structural controls, and native relational SQL mapping layers.

### Direct Comparison Matrix

| Feature | MUMPS (M) | Caché ObjectScript / IRIS |
| :--- | :--- | :--- |
| **Programming Paradigm** | Purely Procedural | Object-Oriented & Procedural |
| **Data Access Methods** | Direct Globals Only | Multi-Model: Objects, SQL, Globals |
| **Variable & Code Scoping** | Global/Local Only | Block-Structured Local Scoping |
| **System Infrastructure** | Legacy Routines (`^%`) | Robust Class Libraries (`##class`) |
| **Error Exception Tools** | Legacy `$ZTRAP` | Structured Try / Catch Blocks |
| **Syntax Representation** | Strict Abbreviations | Supports Full Descriptive Commands |

### Key Structural Differences
1. **Object-Oriented Architecture (OOP):** MUMPS lacks native class structures. Data manipulation requires manually stringing pieces together using functions like `$PIECE`. COS implements classes, methods, inheritance, and properties. It automatically translates object attributes into underlying physical global storage nodes behind the scenes.
2. **Unified Multi-Model Data Engine:** In MUMPS, data exists strictly as key-value hierarchical nodes. To query it relationally, custom cross-referencing routines must be built. COS allows a single data definition to be accessed simultaneously as an object instance, an SQL row in a table, or a raw underlying global.
3. **Exception & Variable Handling:** MUMPS uses procedural scoping where variables can easily leak into subroutines unless explicitly restricted using the `NEW` command. COS supports explicit block parameters, localized method variable scoping, and standardized object-based exception handling (`Try`/`Catch`).

---

## 7. Method Calling Conventions & Legacy Code Standards

### Syntax Implementations
```objectscript
// Private Instance Instantiation and Method Calling
set pt = ##Class(Sample.Patient).%New()
do pt.callMethod()

// Static Class Method Call (Public Method)
do ##Class(Sample.Patient).callPublicMethod()
set x = ##Class(Sample.Patient).callPublicMethod()

// Contextual Class Method Execution Reference
set x = ..callPublicMethod()
```

### Argumentless `DO` (`DO .`) Syntax
Yes, the `DO .` syntax (commonly called the "dot syntax" or argumentless `DO`) can be used in Caché ObjectScript to run indented blocks, but its use is **strongly discouraged** in modern code. Use standard bracket blocks instead.

---

## 8. Concurrency Operations: Transaction Locks & Engine Race Conditions

### Types of Locks
Locks in InterSystems IRIS are managed by the Lock Manager and applied to globals.
- **Exclusive Lock (Default):** `LOCK ^Data(1)` — Only the holding process can modify/read the node. Prevents all other locks.
- **Shared Lock:** `LOCK +^Data(1)` — Multiple processes can read simultaneously. Prevents Exclusive locks.
- **Incremental Lock:** `LOCK +^Data(1)` (while already locked) — Increments the process lock count. Requires matching unlocks to fully release.
- **Immediate Release:** `LOCK -^Data(1)` — Explicitly decrements or releases a held lock.
- **Escalating Lock:** `LOCK ^Data(1)*` — Bundles child subscripts together to reduce lock table memory footprint.

### How to Avoid Race Conditions
Race conditions happen when concurrent processes read/write the same node simultaneously.

- **Strategy A: Use Transactions with Strict Timeouts:** Never use infinite locks. Always specify a timeout (e.g., `:5`). Wrap database modifications inside `TSTART` and `TCOMMIT` blocks.
  ```objectscript
  LOCK +^Invoice(123):5
  If '$Test Quit "Locked"
  TSTART
  // Modify data securely...
  TCOMMIT
  LOCK -^Invoice(123)
  ```
- **Strategy B: Use Atomic Functions (`$INCREMENT`):** For sequential counters, avoid locks entirely. Use `$INCREMENT` (`$I`) to handle race conditions instantly at the engine level.
  ```objectscript
  Set nextID = $INCREMENT(^PatientCounter)
  ```
- **Strategy C: Consistent Locking Order:** To prevent Deadlocks, always lock multiple resources in the exact same order. Alternatively, lock them simultaneously in one line:
  ```objectscript
  LOCK +(^Data(1), ^Data(2)):5
  ```

---

## 9. Performance Tuning: Lazy Loading

In InterSystems IRIS and Caché ObjectScript, **lazy loading** is an automatic optimization framework where the database engine only loads an object's related reference data into memory when your code explicitly requests it, rather than loading the entire object graph up front. This minimizes memory footprints and reduces application overhead.

## 10. Embedded SQL cursor in InterSystems IRIS
An **Embedded SQL cursor in InterSystems IRIS** is a control structure that allows ObjectScript programs to step through a multi-row query result set sequentially, **one row at a time**.

### Lifecycle & Code Implementation

Cursors use a strict sequence where receiving local host variables are prefixed with a colon (`:`).

```objectscript
ClassMethod IteratePatients()
{
    // 1. DECLARE the cursor structure and SQL query
    &sql(DECLARE PatientC CURSOR FOR 
         SELECT Name, DOB INTO :name, :dob 
         FROM Sample.Patient WHERE Active = 1)

    // 2. OPEN the cursor to execute query and allocate system memory
    &sql(OPEN PatientC)
    QUIT:(SQLCODE < 0)

    // 3. FETCH rows inside a traversal loop
    FOR {
        &sql(FETCH PatientC)
        QUIT:(SQLCODE '= 0) // Exit loop if end of data (100) or error (<0)
        
        WRITE "Patient: ", name, " (DOB: ", \$ZDATE(dob, 4), ")", !
    }

    // 4. CLOSE the cursor to release allocated memory
    &sql(CLOSE PatientC)
}
```

### Critical Status Indicators (`SQLCODE`)

*   **`0`**: Successful execution; for `FETCH`, a row was retrieved.
*   **`100`**: Successful execution, but **no more data was found** (end of result set).
*   **`< 0`**: A database error occurred. Terminate and close the cursor immediately.

### Embedded Cursors vs. Dynamic SQL

| Feature | Embedded SQL Cursor | Dynamic SQL Iterator (`%SQL.Statement`) |
| :--- | :--- | :--- |
| **Compilation** | Evaluated and optimized **at compile time** (faster initial execution). | Evaluated and optimized **at runtime** (adds a compile step). |
| **Syntax Style** | Procedural macro blocks (`&sql(...)`). | Object-oriented properties and methods. |
| **Iteration Loop** | `&sql(FETCH CursorName)` inside a `FOR` loop. | `WHILE result.%Next()` loop. |
| **Flexibility** | Rigid; query structure cannot change at runtime. | High; query string can be dynamically built. |



## 11. Disaster Recovery (DR) in InterSystems IRIS
Disaster Recovery (DR) in InterSystems IRIS relies on **Asynchronous Database Mirroring paired with the system's core Journaling Engine** to replicate data across geographically separated data centers. While High Availability (HA) provides local, automatic failover within a single network cluster, DR focuses on business continuity across long-distance networks during a major regional outage.

---

### High Availability (HA) vs. Disaster Recovery (DR) in IRIS

InterSystems IRIS partitions its redundancy architecture into distinct synchronous and asynchronous mirror configurations:

| Metric | High Availability (HA) Pair | Disaster Recovery (DR) Async |
| :--- | :--- | :--- |
| **Mirror Type** | **Synchronous Mirroring**. | **Asynchronous Mirroring**. |
| **Network Proximity** | Local network (LAN / low latency). | Cross-region (WAN / higher latency). |
| **Failover Mode** | **Automatic** via the IRIS Arbiter and ISCAgent. | **Manual Promotion** by a database administrator. |
| **Capacity Scale** | Strictly 2 nodes (Primary and Backup pair). | Up to 14 concurrent DR Async members per mirror. |
| **Data Status** | Real-time transaction blocking until acknowledged. | Buffered transmission queue; no performance impact on Primary. |

---

### How the Data Replication Engine Works

The DR engine avoids system storage-level overhead by transmitting logical transactional updates instead of physical disk sector blocks:

1. **Journal Collection:** Every database write mutation (`SET` or `KILL`) on the active Primary instance is recorded locally by the Journaling mechanism.
2. **Log Transport:** The primary node reads its `.jrn` output logs and streams them asynchronously over a secure TLS/TCP network socket to the distant DR sites.
3. **Dejournaling Loop:** The receiving DR Async member catches the incoming streamed data chunks. It replays the transactions sequentially onto its copy of the databases using a native background thread ("dejournaling").
4. **Read-Only Scoping:** By default, DR mirror databases are held in a strict **Read-Only state**. This locks the schemas down to preserve logical alignment with the primary database.

---

### Failover and Promotion Flow During a Disaster

When a catastrophe wipes out the main data center (destroying both the Primary and Backup HA instances), the administrator implements a **Disaster Recovery Promotion Strategy** to resume operational uptime:

* **Isolation Verification:** Administrators confirm that the old primary data center is fully disconnected to prevent "split-brain" conflicts.
* **Log Catchup:** The chosen DR Async member processes any remaining in-flight journal packets left inside its transmission buffer queue.
* **Role Promotion:** The administrator executes an explicit system routine or uses the Management Portal Interface to change the node's architectural scope, converting the DR Async member into the active **Primary Mirror Node**.
* **Network Remapping:** Global Traffic Managers (GTM) or virtual routing services redirect incoming user network endpoints to point directly to the newly promoted site.
