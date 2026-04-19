var SUBJECTS = [
  {
    name: "Theory of Computation",
    short: "TOC",
    credits: 4,
    internal: 40,
    endSem: 60,
    units: [
      {
        name: "Finite State Systems",
        topics: [
          { name: "Finite State Systems & Basic Definitions", priority: "HIGH", done: false, unit: 1 },
          { name: "Non-Deterministic Finite Automata (NDFA)", priority: "HIGH", done: false, unit: 1 },
          { name: "Deterministic Finite Automata (DFA)", priority: "HIGH", done: false, unit: 1 },
          { name: "Equivalence of DFA and NDFA", priority: "HIGH", done: false, unit: 1 },
          { name: "Finite Automata with epsilon-moves", priority: "HIGH", done: false, unit: 1 },
          { name: "Minimization of Finite Automata", priority: "HIGH", done: false, unit: 1 },
          { name: "Concept of Basic Machine", priority: "HIGH", done: false, unit: 1 },
          { name: "Properties and Limitations of FSM", priority: "HIGH", done: false, unit: 1 },
          { name: "Moore and Mealy Machines", priority: "HIGH", done: false, unit: 1 },
          { name: "Equivalence of Moore and Mealy Machines", priority: "HIGH", done: false, unit: 1 },
          { name: "Pumping Lemma", priority: "HIGH", done: false, unit: 1 }
        ]
      },
      {
        name: "Regular Expressions",
        topics: [
          { name: "Regular Grammars", priority: "HIGH", done: false, unit: 2 },
          { name: "Regular Expressions", priority: "HIGH", done: false, unit: 2 },
          { name: "Equivalence between Regular Languages", priority: "HIGH", done: false, unit: 2 },
          { name: "Properties of Regular Languages", priority: "HIGH", done: false, unit: 2 },
          { name: "Equivalence of Finite Automata and Regular Expressions", priority: "HIGH", done: false, unit: 2 },
          { name: "Regular Expression Conversion and vice versa", priority: "HIGH", done: false, unit: 2 },
          { name: "Conversion of NFA to DFA by Arden's Method", priority: "HIGH", done: false, unit: 2 }
        ]
      },
      {
        name: "Grammar & Context Free Languages",
        topics: [
          { name: "Context Free Languages (CFL)", priority: "MED", done: false, unit: 3 },
          { name: "Leftmost and Rightmost Derivation", priority: "MED", done: false, unit: 3 },
          { name: "Parsing and Ambiguity", priority: "MED", done: false, unit: 3 },
          { name: "Chomsky Hierarchy", priority: "MED", done: false, unit: 3 },
          { name: "LR(k) Grammars", priority: "MED", done: false, unit: 3 },
          { name: "Properties of LR(k) Grammars", priority: "MED", done: false, unit: 3 },
          { name: "Simplification of CFG", priority: "MED", done: false, unit: 3 },
          { name: "Normal Forms", priority: "MED", done: false, unit: 3 }
        ]
      },
      {
        name: "Pushdown Automata",
        topics: [
          { name: "Pushdown Automata — Definition", priority: "MED", done: false, unit: 4 },
          { name: "Instantaneous Description", priority: "MED", done: false, unit: 4 },
          { name: "Applications of Pushdown Machines", priority: "MED", done: false, unit: 4 },
          { name: "NDPDA and DPDA", priority: "MED", done: false, unit: 4 },
          { name: "Equivalence: PDA to CFL and vice versa", priority: "MED", done: false, unit: 4 },
          { name: "Pumping Lemma for CFL", priority: "MED", done: false, unit: 4 }
        ]
      },
      {
        name: "Turing Machines & Computational Complexity",
        topics: [
          { name: "Turing Machines — Introduction & Definition", priority: "MED", done: false, unit: 5 },
          { name: "Instantaneous Description", priority: "MED", done: false, unit: 5 },
          { name: "Turing Machine as Acceptors", priority: "MED", done: false, unit: 5 },
          { name: "Halting Problem of TM", priority: "MED", done: false, unit: 5 },
          { name: "Undecidability Basics", priority: "MED", done: false, unit: 5 },
          { name: "Post's Correspondence Problem", priority: "MED", done: false, unit: 5 },
          { name: "Rice's Theorem", priority: "MED", done: false, unit: 5 },
          { name: "Properties of Recursive and Recursively Enumerable Languages", priority: "MED", done: false, unit: 5 },
          { name: "Introduction to NP-Hardness", priority: "MED", done: false, unit: 5 },
          { name: "Introduction to NP-Completeness", priority: "MED", done: false, unit: 5 }
        ]
      }
    ]
  },
  {
    name: "Analysis and Design of Algorithms",
    short: "ADA",
    credits: 3,
    internal: 40,
    endSem: 60,
    units: [
      {
        name: "Introduction",
        topics: [
          { name: "Algorithm analysis: Time and Space Complexity", priority: "HIGH", done: false, unit: 1 },
          { name: "Asymptotic Notations and properties", priority: "HIGH", done: false, unit: 1 },
          { name: "Best case, Worst case, Average case analysis", priority: "HIGH", done: false, unit: 1 },
          { name: "Recurrence relation: Substitution method", priority: "HIGH", done: false, unit: 1 },
          { name: "Lower bounds", priority: "HIGH", done: false, unit: 1 },
          { name: "Linear Search, Binary Search, Interpolation Search", priority: "HIGH", done: false, unit: 1 },
          { name: "Pattern Search: Naive string-matching algorithm", priority: "HIGH", done: false, unit: 1 },
          { name: "Rabin-Karp algorithm", priority: "HIGH", done: false, unit: 1 },
          { name: "Knuth-Morris-Pratt algorithm", priority: "HIGH", done: false, unit: 1 },
          { name: "Sorting: Insertion sort, Heap sort", priority: "HIGH", done: false, unit: 1 }
        ]
      },
      {
        name: "Graph Algorithms",
        topics: [
          { name: "Representations of graphs", priority: "HIGH", done: false, unit: 2 },
          { name: "Graph traversal: DFS and BFS applications", priority: "HIGH", done: false, unit: 2 },
          { name: "Connectivity, Strong connectivity, Bi-connectivity", priority: "HIGH", done: false, unit: 2 },
          { name: "Minimum Spanning Tree: Kruskal's and Prim's", priority: "HIGH", done: false, unit: 2 },
          { name: "Shortest path: Bellman-Ford algorithm", priority: "HIGH", done: false, unit: 2 },
          { name: "Dijkstra's algorithm", priority: "HIGH", done: false, unit: 2 },
          { name: "Floyd-Warshall algorithm", priority: "HIGH", done: false, unit: 2 },
          { name: "Network flow: Flow networks, Ford-Fulkerson method", priority: "HIGH", done: false, unit: 2 },
          { name: "Maximum bipartite matching", priority: "HIGH", done: false, unit: 2 }
        ]
      },
      {
        name: "Algorithm Design Techniques",
        topics: [
          { name: "Divide and Conquer: Finding maximum and minimum", priority: "MED", done: false, unit: 3 },
          { name: "Merge sort, Quick sort", priority: "MED", done: false, unit: 3 },
          { name: "Dynamic Programming: Elements", priority: "MED", done: false, unit: 3 },
          { name: "Matrix-chain multiplication", priority: "MED", done: false, unit: 3 },
          { name: "Multi stage graph", priority: "MED", done: false, unit: 3 },
          { name: "Optimal Binary Search Trees", priority: "MED", done: false, unit: 3 },
          { name: "Greedy Technique: Elements", priority: "MED", done: false, unit: 3 },
          { name: "Activity-selection problem", priority: "MED", done: false, unit: 3 },
          { name: "Optimal Merge pattern", priority: "MED", done: false, unit: 3 },
          { name: "Huffman Trees", priority: "MED", done: false, unit: 3 }
        ]
      },
      {
        name: "State Space Search Algorithms",
        topics: [
          { name: "Backtracking: N-Queens problem", priority: "MED", done: false, unit: 4 },
          { name: "Hamiltonian Circuit Problem", priority: "MED", done: false, unit: 4 },
          { name: "Subset Sum Problem", priority: "MED", done: false, unit: 4 },
          { name: "Graph colouring problem", priority: "MED", done: false, unit: 4 },
          { name: "Branch and Bound: 15-Puzzle problem", priority: "MED", done: false, unit: 4 },
          { name: "Assignment problem", priority: "MED", done: false, unit: 4 },
          { name: "Knapsack Problem", priority: "MED", done: false, unit: 4 },
          { name: "Travelling Salesman Problem", priority: "MED", done: false, unit: 4 }
        ]
      },
      {
        name: "NP-Complete and Approximation",
        topics: [
          { name: "Tractable and intractable problems", priority: "MED", done: false, unit: 5 },
          { name: "Polynomial time algorithms", priority: "MED", done: false, unit: 5 },
          { name: "NP-algorithms", priority: "MED", done: false, unit: 5 },
          { name: "NP-hardness and NP-completeness", priority: "MED", done: false, unit: 5 },
          { name: "Bin Packing problem", priority: "MED", done: false, unit: 5 },
          { name: "Problem reduction: TSP, 3-CNF", priority: "MED", done: false, unit: 5 },
          { name: "Approximation Algorithms", priority: "MED", done: false, unit: 5 },
          { name: "Randomized Algorithms: primality testing", priority: "MED", done: false, unit: 5 },
          { name: "TSP, Randomized quick sort", priority: "MED", done: false, unit: 5 },
          { name: "Finding kth smallest number", priority: "MED", done: false, unit: 5 }
        ]
      }
    ]
  },
  {
    name: "Discrete Structures",
    short: "DS",
    credits: 4,
    internal: 40,
    endSem: 60,
    units: [
      {
        name: "Introduction to Logic",
        topics: [
          { name: "Propositional Logic", priority: "HIGH", done: false, unit: 1 },
          { name: "Applications of Propositional Logic", priority: "HIGH", done: false, unit: 1 },
          { name: "Propositional Equivalences", priority: "HIGH", done: false, unit: 1 },
          { name: "Predicates and Quantifiers", priority: "HIGH", done: false, unit: 1 },
          { name: "Nested Quantifiers", priority: "HIGH", done: false, unit: 1 },
          { name: "Rules of Inference", priority: "HIGH", done: false, unit: 1 },
          { name: "Introduction to Proofs", priority: "HIGH", done: false, unit: 1 },
          { name: "Proof Methods and Strategy", priority: "HIGH", done: false, unit: 1 },
          { name: "Mathematical Induction: examples", priority: "HIGH", done: false, unit: 1 },
          { name: "Strong Induction", priority: "HIGH", done: false, unit: 1 },
          { name: "Well Ordering Principle", priority: "HIGH", done: false, unit: 1 },
          { name: "Invariants", priority: "HIGH", done: false, unit: 1 }
        ]
      },
      {
        name: "Basic Mathematical Structures",
        topics: [
          { name: "Sets: definition, types, Venn Diagram", priority: "HIGH", done: false, unit: 2 },
          { name: "Set notation with Quantifiers", priority: "HIGH", done: false, unit: 2 },
          { name: "Set Operations and Set Identities", priority: "HIGH", done: false, unit: 2 },
          { name: "Functions: definition, properties, types", priority: "HIGH", done: false, unit: 2 },
          { name: "Comparing infinite sets using functions", priority: "HIGH", done: false, unit: 2 },
          { name: "Countable and countably infinite sets", priority: "HIGH", done: false, unit: 2 },
          { name: "Relations: equivalence relations", priority: "HIGH", done: false, unit: 2 },
          { name: "Partitions of a set", priority: "HIGH", done: false, unit: 2 },
          { name: "Partial order relations, Posets", priority: "HIGH", done: false, unit: 2 },
          { name: "Hasse diagram, Chains, Anti-chains", priority: "HIGH", done: false, unit: 2 }
        ]
      },
      {
        name: "Counting Techniques",
        topics: [
          { name: "Product and sum principles", priority: "MED", done: false, unit: 3 },
          { name: "Bijection principle, Division rule", priority: "MED", done: false, unit: 3 },
          { name: "Double counting, Handshake lemma", priority: "MED", done: false, unit: 3 },
          { name: "Binomial theorem, Pascal's triangle", priority: "MED", done: false, unit: 3 },
          { name: "Permutations and combinations with and without repetitions", priority: "MED", done: false, unit: 3 },
          { name: "Sequences: sum and product of sequences", priority: "MED", done: false, unit: 3 },
          { name: "Estimating factorials", priority: "MED", done: false, unit: 3 },
          { name: "Recurrence relations", priority: "MED", done: false, unit: 3 },
          { name: "Solving recurrence relations", priority: "MED", done: false, unit: 3 },
          { name: "Solving via generating functions", priority: "MED", done: false, unit: 3 },
          { name: "Pigeon-hole principle (PHP)", priority: "MED", done: false, unit: 3 },
          { name: "PHP variants and applications", priority: "MED", done: false, unit: 3 }
        ]
      },
      {
        name: "Graph Theory",
        topics: [
          { name: "Basic terminology", priority: "MED", done: false, unit: 4 },
          { name: "Konigsberg bridge problem", priority: "MED", done: false, unit: 4 },
          { name: "Eulerian graphs, Hamiltonian graphs", priority: "MED", done: false, unit: 4 },
          { name: "Bipartite graphs and characterization", priority: "MED", done: false, unit: 4 },
          { name: "Planar graphs", priority: "MED", done: false, unit: 4 },
          { name: "Representation of graphs", priority: "MED", done: false, unit: 4 },
          { name: "Graph isomorphism and homomorphism", priority: "MED", done: false, unit: 4 },
          { name: "Graph coloring", priority: "MED", done: false, unit: 4 },
          { name: "Subgraphs, cliques, independent sets", priority: "MED", done: false, unit: 4 },
          { name: "Large bipartite subgraphs", priority: "MED", done: false, unit: 4 },
          { name: "Connected components, cut edges", priority: "MED", done: false, unit: 4 },
          { name: "Matchings, Perfect and maximum matchings", priority: "MED", done: false, unit: 4 }
        ]
      },
      {
        name: "Algebraic Systems and Number Theory",
        topics: [
          { name: "Semigroup, Monoid, Groups", priority: "MED", done: false, unit: 5 },
          { name: "Abelian group, Cyclic group, Subgroup", priority: "MED", done: false, unit: 5 },
          { name: "Order of a group and subgroups", priority: "MED", done: false, unit: 5 },
          { name: "Lagrange's theorem", priority: "MED", done: false, unit: 5 },
          { name: "Group isomorphism and homomorphism", priority: "MED", done: false, unit: 5 },
          { name: "Modular arithmetic", priority: "MED", done: false, unit: 5 },
          { name: "Applications to cryptography", priority: "MED", done: false, unit: 5 },
          { name: "Euclid's Algorithm", priority: "MED", done: false, unit: 5 },
          { name: "Primes", priority: "MED", done: false, unit: 5 },
          { name: "Chinese Remainder theorem", priority: "MED", done: false, unit: 5 }
        ]
      }
    ]
  },
  {
    name: "Database Security",
    short: "DBSEC",
    credits: 3,
    internal: 40,
    endSem: 60,
    units: [
      {
        name: "Introduction",
        topics: [
          { name: "Database Security and its need", priority: "HIGH", done: false, unit: 1 },
          { name: "Security Threats: Hackers, Social Engineers, Computer Users, Network and DB Administrators, Internet, Misleading Applications, Emails, Instant Messages, Tweets", priority: "HIGH", done: false, unit: 1 },
          { name: "Malware: Computer Viruses, Worms, Trojan Virus, Bots", priority: "HIGH", done: false, unit: 1 },
          { name: "Security Architecture", priority: "HIGH", done: false, unit: 1 },
          { name: "Database Structure components", priority: "HIGH", done: false, unit: 1 },
          { name: "Database Models, Object Oriented database, Object Relational database", priority: "HIGH", done: false, unit: 1 },
          { name: "Relationships", priority: "HIGH", done: false, unit: 1 },
          { name: "Database types: OLTP, OLAP/DSS", priority: "HIGH", done: false, unit: 1 }
        ]
      },
      {
        name: "Database Security",
        topics: [
          { name: "Authentication, Authorization and Administration", priority: "HIGH", done: false, unit: 2 },
          { name: "Firewalls, Virtual Private Networks", priority: "HIGH", done: false, unit: 2 },
          { name: "Intrusion Detection and Prevention", priority: "HIGH", done: false, unit: 2 },
          { name: "Vulnerability Assessment and Patch Management", priority: "HIGH", done: false, unit: 2 },
          { name: "Security Management, Antivirus", priority: "HIGH", done: false, unit: 2 },
          { name: "Security parameters for IDS and IPS", priority: "HIGH", done: false, unit: 2 },
          { name: "Securing core, Application security", priority: "HIGH", done: false, unit: 2 },
          { name: "Public Key Infrastructure", priority: "HIGH", done: false, unit: 2 },
          { name: "Vulnerability Management: vulnerability scanner, monitoring and baselining", priority: "HIGH", done: false, unit: 2 },
          { name: "Patch management, Incident management", priority: "HIGH", done: false, unit: 2 }
        ]
      },
      {
        name: "Authentication and Password Security",
        topics: [
          { name: "Anatomy of vulnerability", priority: "MED", done: false, unit: 3 },
          { name: "Understanding authentication types", priority: "MED", done: false, unit: 3 },
          { name: "Assigning system administrator privileges", priority: "MED", done: false, unit: 3 },
          { name: "Choosing strong passwords", priority: "MED", done: false, unit: 3 },
          { name: "Account lockout", priority: "MED", done: false, unit: 3 },
          { name: "Passwords for all database components", priority: "MED", done: false, unit: 3 },
          { name: "Hijacking the Oracle Listener", priority: "MED", done: false, unit: 3 },
          { name: "Setting listener password", priority: "MED", done: false, unit: 3 }
        ]
      },
      {
        name: "Database Security Tools",
        topics: [
          { name: "Granular Access Control", priority: "MED", done: false, unit: 4 },
          { name: "Securing Database-to-Database communication", priority: "MED", done: false, unit: 4 },
          { name: "Overview of database security analysis methods", priority: "MED", done: false, unit: 4 },
          { name: "SQL Injections", priority: "MED", done: false, unit: 4 },
          { name: "Database Security Scanners", priority: "MED", done: false, unit: 4 }
        ]
      },
      {
        name: "Advanced Database Security",
        topics: [
          { name: "Virtual Private Database (VPD)", priority: "MED", done: false, unit: 5 },
          { name: "VPD Working and Benefits", priority: "MED", done: false, unit: 5 },
          { name: "Row-level VPD", priority: "MED", done: false, unit: 5 },
          { name: "Column-level VPD", priority: "MED", done: false, unit: 5 },
          { name: "Row Level Security", priority: "MED", done: false, unit: 5 },
          { name: "Column Level Security", priority: "MED", done: false, unit: 5 },
          { name: "Access Control: Label Based Access Control", priority: "MED", done: false, unit: 5 },
          { name: "Label types", priority: "MED", done: false, unit: 5 }
        ]
      }
    ]
  },
  {
    name: "Statistical Methods",
    short: "STATS",
    credits: "TBD",
    internal: "TBD",
    endSem: "TBD",
    units: [
      {
        name: "TBD",
        topics: []
      },
      {
        name: "Univariate Data Analysis",
        topics: [
          { name: "Measures of Central Tendency: mathematical", priority: "HIGH", done: false, unit: 2 },
          { name: "Measures of Central Tendency: positional", priority: "HIGH", done: false, unit: 2 },
          { name: "Measures of Dispersion: range", priority: "HIGH", done: false, unit: 2 },
          { name: "Quartile deviation", priority: "HIGH", done: false, unit: 2 },
          { name: "Mean deviation", priority: "HIGH", done: false, unit: 2 },
          { name: "Standard deviation", priority: "HIGH", done: false, unit: 2 },
          { name: "Coefficient of variation", priority: "HIGH", done: false, unit: 2 },
          { name: "Skewness and Kurtosis", priority: "HIGH", done: false, unit: 2 }
        ]
      },
      {
        name: "Bivariate Data Analysis",
        topics: [
          { name: "Bivariate Data, Scatter plot", priority: "MED", done: false, unit: 3 },
          { name: "Correlation", priority: "MED", done: false, unit: 3 },
          { name: "Karl Pearson's correlation coefficient", priority: "MED", done: false, unit: 3 },
          { name: "Rank correlation: Spearman's measure", priority: "MED", done: false, unit: 3 },
          { name: "Rank correlation: Kendall's measure", priority: "MED", done: false, unit: 3 },
          { name: "Concept of errors", priority: "MED", done: false, unit: 3 },
          { name: "Principle of least squares", priority: "MED", done: false, unit: 3 },
          { name: "Fitting of polynomial curves", priority: "MED", done: false, unit: 3 },
          { name: "Fitting of exponential curves", priority: "MED", done: false, unit: 3 },
          { name: "Simple linear regression and properties", priority: "MED", done: false, unit: 3 },
          { name: "Fitting of linear regression line", priority: "MED", done: false, unit: 3 },
          { name: "Coefficient of determination", priority: "MED", done: false, unit: 3 }
        ]
      },
      {
        name: "Probability",
        topics: [
          { name: "Introduction, random experiments", priority: "MED", done: false, unit: 4 },
          { name: "Sample space, events, algebra of events", priority: "MED", done: false, unit: 4 },
          { name: "Definitions: classical, statistical, axiomatic", priority: "MED", done: false, unit: 4 },
          { name: "Conditional Probability", priority: "MED", done: false, unit: 4 },
          { name: "Laws of addition and multiplication", priority: "MED", done: false, unit: 4 },
          { name: "Independent events", priority: "MED", done: false, unit: 4 },
          { name: "Theorem of total probability", priority: "MED", done: false, unit: 4 },
          { name: "Bayes' theorem and applications", priority: "MED", done: false, unit: 4 }
        ]
      },
      {
        name: "TBD",
        topics: []
      }
    ]
  }
];
