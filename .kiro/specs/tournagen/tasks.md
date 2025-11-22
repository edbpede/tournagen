# Implementation Plan

## Overview

This implementation plan breaks down the TournaGen application into discrete, manageable tasks. Each task builds incrementally on previous work, with checkpoints to ensure tests pass. The plan follows a modular approach, implementing the core architecture first, then adding tournament formats one by one.

## Task List

- [x] 1. Configure project foundation and design system
  - Set up TypeScript strict mode, UnoCSS configuration, and design system tokens
  - Configure Astro with proper integration order (UnoCSS before SolidJS)
  - Create UnoCSS shortcuts for buttons, cards, inputs, and tournament-specific components
  - Set up color palette, typography scale, and spacing system
  - _Requirements: 18.1, 18.3, 14.1, 14.2, 14.3_

- [x] 2. Implement core type system and interfaces
  - [x] 2.1 Create base tournament types and discriminated unions
    - Define `Participant`, `BaseTournamentConfig`, and `TournamentConfig` discriminated union
    - Define `TournamentFormatType` enum
    - Define `TournamentStructure` types (bracket, league, stage, racing)
    - _Requirements: 17.2_
  
  - [x] 2.2 Create tournament format plugin interface
    - Define `TournamentFormat<TConfig>` interface with metadata, config, generation, and components
    - Define `ValidationResult` discriminated union
    - Create type-safe component prop interfaces
    - _Requirements: 17.2, 17.3_
  
  - [x] 2.3 Implement format registry
    - Create `TournamentFormatRegistry` class with register/get/getAll methods
    - Export global registry instance
    - _Requirements: 17.1, 17.5_

- [ ] 3. Create global state management
  - [x] 3.1 Implement tournament state store
    - Create `TournamentState` interface with currentConfig, currentStructure, step, isDirty
    - Export global store using `createStore` (not `createSignal` - nested object)
    - Create derived memos for currentFormat and other computed values
    - _Requirements: 2.4, 15.3_
  
  - [ ] 3.2 Create state update utilities
    - Implement `updateParticipant` with fine-grained store updates
    - Implement `updateMultipleParticipants` using `batch()`
    - Implement `setCurrentFormat` and `setCurrentStep`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Build landing page
  - [ ] 4.1 Create hero section component
    - Build static Astro component with heading, description, and CTA button
    - Apply design system styles using UnoCSS shortcuts
    - _Requirements: 1.1_
  
  - [ ] 4.2 Create format card component
    - Build Astro component accepting format metadata as props
    - Display title, description, icon, and use cases
    - Apply card styles with hover effects
    - _Requirements: 1.2, 1.3_
  
  - [ ] 4.3 Build landing page with dynamic format cards
    - Create `index.astro` with hero, format cards section, and features
    - Dynamically generate format cards from registry
    - Add responsive layout with breakpoints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 17.5_

- [ ] 5. Implement import/export functionality
  - [ ] 5.1 Create export utility
    - Implement `exportTournament` function that serializes config to JSON
    - Trigger browser download with proper filename
    - Ensure human-readable JSON structure
    - _Requirements: 5.1, 5.4_
  
  - [ ] 5.2 Create import utility
    - Implement `importTournament` function that parses and validates JSON
    - Return discriminated union for success/error
    - Handle invalid JSON, schema errors, and missing formats
    - _Requirements: 5.2, 5.3_
  
  - [ ] 5.3 Implement local storage persistence
    - Create `saveToLocalStorage` and `loadFromLocalStorage` functions
    - Validate data from local storage before loading
    - Handle storage errors gracefully
    - _Requirements: 5.5, 16.5_
  
  - [ ] 5.4 Write property test for export-import round trip
    - **Property 15: Export-import round trip**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 6. Build tournament builder shell
  - [ ] 6.1 Create builder page structure
    - Create `builder.astro` with main layout
    - Add progress indicator for steps
    - Set up error boundary for islands
    - _Requirements: 2.1_
  
  - [ ] 6.2 Create format selector island
    - Build SolidJS component with format cards
    - Use `<For>` to render formats from registry
    - Update global state on selection
    - Apply proper `Component<Props>` typing without prop destructuring
    - _Requirements: 2.1, 17.5, 18.2_
  
  - [ ] 6.3 Create step navigation component
    - Build navigation with back/next buttons
    - Disable back on first step
    - Update global state step on navigation
    - _Requirements: 2.2_

- [ ] 7. Build participant manager island
  - [ ] 7.1 Create participant list component
    - Use `<For>` for participant rendering (not `.map()`)
    - Display participant name, seed, and optional fields
    - Apply fine-grained reactivity for individual updates
    - _Requirements: 3.1, 3.2, 18.2_
  
  - [ ] 7.2 Implement add participant functionality
    - Create input form with validation
    - Call state update function on submit
    - Clear input after successful add
    - _Requirements: 3.1_
  
  - [ ] 7.3 Implement edit and remove functionality
    - Add inline edit for participant names
    - Add remove button with confirmation
    - Update tournament structure on changes
    - _Requirements: 3.2, 3.3_
  
  - [ ] 7.4 Implement participant reordering
    - Add drag-and-drop or up/down buttons
    - Update seeding on reorder
    - _Requirements: 3.4_
  
  - [ ] 7.5 Add optional fields support
    - Add inputs for seed, team, nationality, metadata
    - Store in participant object
    - _Requirements: 3.5_
  
  - [ ] 7.6 Write property tests for participant operations
    - **Property 7: Participant addition**
    - **Property 8: Participant removal**
    - **Property 9: Participant reordering**
    - **Property 10: Optional participant fields**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**

- [ ] 8. Implement single elimination format
  - [ ] 8.1 Create single elimination types and config
    - Define `SingleEliminationConfig` interface
    - Define `SingleEliminationOptions` interface
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 8.2 Implement bracket generation algorithm
    - Create `generateSingleEliminationBracket` function
    - Calculate round count based on participant count
    - Generate first round with byes
    - Generate subsequent rounds with proper feedsInto references
    - Add third-place playoff if enabled
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 8.3 Implement seeding utilities
    - Create `applySeedingMethod` function supporting random, seeded, manual
    - Implement standard seeding algorithm (1 vs N, 2 vs N-1, etc.)
    - _Requirements: 6.5_
  
  - [ ] 8.4 Write property tests for single elimination
    - **Property 19: Single elimination round calculation**
    - **Property 20: Bye generation**
    - **Property 21: Bracket structure validity**
    - **Property 22: Third-place playoff**
    - **Property 23: Seeding method support**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**
  
  - [ ] 8.5 Create configuration panel component
    - Build SolidJS component with proper `Component<Props>` typing
    - Never destructure props - access via `props.xyz`
    - Add controls for third-place playoff, bracket size, seeding method
    - Call onChange with updated config
    - _Requirements: 6.4, 6.5, 18.2_
  
  - [ ] 8.6 Create bracket visualizer component
    - Build SolidJS component rendering bracket structure
    - Use SVG for connecting lines between matches
    - Display round labels and match boxes
    - Highlight byes and winners
    - Apply tournament-specific UnoCSS shortcuts
    - _Requirements: 4.1, 4.2, 6.3_
  
  - [ ] 8.7 Register single elimination format
    - Create format object implementing `TournamentFormat` interface
    - Register in global registry
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement double elimination format
  - [ ] 10.1 Create double elimination types and config
    - Define `DoubleEliminationConfig` interface
    - Define `DoubleEliminationOptions` interface
    - Define `DoubleEliminationStructure` extending `BracketStructure`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 10.2 Implement double elimination generation
    - Create `generateDoubleEliminationBracket` function
    - Generate winners bracket
    - Generate losers bracket with drop-down connections
    - Generate grand final and optional reset match
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  
  - [ ] 10.3 Write property tests for double elimination
    - **Property 24: Double elimination structure**
    - **Property 25: Winners-to-losers connections**
    - **Property 26: Grand final reset**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.5**
  
  - [ ] 10.4 Create configuration panel component
    - Add controls for reset rule, starting bracket, placement matches
    - Follow SolidJS prop patterns (no destructuring)
    - _Requirements: 7.4, 7.5, 18.2_
  
  - [ ] 10.5 Create double elimination visualizer
    - Render winners and losers brackets side-by-side
    - Show drop-down connectors from winners to losers
    - Highlight grand final and reset match
    - _Requirements: 4.1, 7.1, 7.2, 7.3, 7.5_
  
  - [ ] 10.6 Register double elimination format
    - Create and register format in registry
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 11. Implement round robin format
  - [ ] 11.1 Create round robin types and config
    - Define `RoundRobinConfig` interface
    - Define `LeagueStructure`, `Group`, `Fixture`, `Standings` types
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 11.2 Implement round robin scheduling
    - Create `generateRoundRobinSchedule` using circle method
    - Support single, double, triple round robin
    - Group fixtures by rounds
    - _Requirements: 8.1, 8.3_
  
  - [ ] 11.3 Implement standings calculation
    - Create `calculateStandings` function
    - Calculate played, wins, draws, losses, points
    - Support custom scoring rules
    - _Requirements: 8.2_
  
  - [ ] 11.4 Write property tests for round robin
    - **Property 27: Round robin fixture count**
    - **Property 28: Standings structure**
    - **Property 29: Fixture organization**
    - **Property 30: Group separation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
  
  - [ ] 11.5 Create configuration panel component
    - Add controls for round count, group configuration, scoring rules
    - Follow SolidJS patterns
    - _Requirements: 8.1, 8.4, 18.2_
  
  - [ ] 11.6 Create round robin visualizer
    - Render standings tables with all required columns
    - Render fixtures grouped by rounds
    - Show group-to-knockout connectors if applicable
    - _Requirements: 4.3, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 11.7 Register round robin format
    - Create and register format
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 12. Implement Swiss format
  - [ ] 12.1 Create Swiss types and config
    - Define `SwissConfig` interface
    - Extend `LeagueStructure` for Swiss
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 12.2 Implement Swiss pairing algorithm
    - Create `generateSwissPairings` function
    - Group participants by score
    - Pair within score groups avoiding repeats
    - Handle byes for odd numbers
    - _Requirements: 9.1, 9.2_
  
  - [ ] 12.3 Implement Swiss standings
    - Calculate cumulative scores across rounds
    - Support custom point values
    - Add tiebreaker support
    - _Requirements: 9.3, 9.4_
  
  - [ ] 12.4 Write property tests for Swiss
    - **Property 31: Swiss pairing by score**
    - **Property 32: Swiss repeat avoidance**
    - **Property 33: Swiss standings accumulation**
    - **Property 34: Swiss custom scoring**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
  
  - [ ] 12.5 Create configuration panel component
    - Add controls for round count, scoring, repeat avoidance
    - Follow SolidJS patterns
    - _Requirements: 9.4, 18.2_
  
  - [ ] 12.6 Create Swiss visualizer
    - Render round-by-round pairings
    - Render cumulative standings table
    - Show progression indicators
    - _Requirements: 9.5_
  
  - [ ] 12.7 Register Swiss format
    - Create and register format
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement free-for-all format
  - [ ] 14.1 Create FFA types and config
    - Define `FFAConfig` interface
    - Define `StageStructure`, `Stage`, `StageMatch` types
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 14.2 Implement FFA stage generation
    - Create `generateFFAStages` function
    - Distribute participants into lobbies
    - Generate stages with advancement rules
    - Create final stage
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 14.3 Write property tests for FFA
    - **Property 35: FFA match participant limits**
    - **Property 36: FFA advancement rules**
    - **Property 37: FFA stage structure**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  
  - [ ] 14.4 Create configuration panel component
    - Add controls for lobby size, advancement count, final size
    - Follow SolidJS patterns
    - _Requirements: 10.1, 10.2, 18.2_
  
  - [ ] 14.5 Create FFA visualizer
    - Render stage blocks with match participants
    - Highlight advancing participants
    - Show stage-to-stage connectors
    - _Requirements: 4.4, 10.3, 10.4, 10.5_
  
  - [ ] 14.6 Register FFA format
    - Create and register format
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 15. Implement FIFA-style format
  - [ ] 15.1 Create FIFA types and config
    - Define `FIFAConfig` interface
    - Define hybrid structure with groups and knockout
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ] 15.2 Implement FIFA structure generation
    - Create `generateFIFAStructure` function
    - Distribute participants into groups
    - Generate round robin for each group
    - Determine advancing teams
    - Generate knockout bracket with group position references
    - _Requirements: 11.1, 11.2, 11.4_
  
  - [ ] 15.3 Write property tests for FIFA
    - **Property 38: FIFA group structure**
    - **Property 39: FIFA advancement configuration**
    - **Property 40: FIFA group standings**
    - **Property 41: FIFA bracket mapping**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
  
  - [ ] 15.4 Create configuration panel component
    - Add controls for group count, teams per group, advancement, knockout options
    - Follow SolidJS patterns
    - _Requirements: 11.2, 11.5, 18.2_
  
  - [ ] 15.5 Create FIFA visualizer
    - Render group tables with football-specific stats
    - Render knockout bracket
    - Show group-to-bracket connectors with labels
    - _Requirements: 4.3, 11.3, 11.4_
  
  - [ ] 15.6 Register FIFA format
    - Create and register format
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 16. Implement racing formats
  - [ ] 16.1 Create racing types and config
    - Define `RacingConfig` discriminated union for MK and F1
    - Define `RacingStructure`, `RacingEvent`, `RacingSession`, `RacingResult` types
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 16.2 Implement Mario Kart time trial
    - Create `generateTimeTrial` function
    - Rank by fastest times with deltas
    - _Requirements: 12.1_
  
  - [ ] 16.3 Implement Mario Kart grand prix
    - Create `generateGrandPrix` function
    - Support multiple races with points per position
    - Calculate cumulative standings
    - _Requirements: 12.2, 12.5_
  
  - [ ] 16.4 Implement Mario Kart knockout cup
    - Create `generateKnockoutCup` function
    - Eliminate lowest-placed after each race
    - Track progression to final
    - _Requirements: 12.3, 12.4_
  
  - [ ] 16.5 Implement F1 single Grand Prix
    - Create `generateF1GrandPrix` function
    - Support qualifying and race sessions
    - Qualifying sets starting grid
    - _Requirements: 13.1_
  
  - [ ] 16.6 Implement F1 championship season
    - Create `generateF1Championship` function
    - Track driver and team standings across events
    - Support sprint races
    - _Requirements: 13.2, 13.3, 13.5_
  
  - [ ] 16.7 Implement F1 playoff format
    - Create `generateF1Playoff` function
    - Support heats feeding into semifinals and finals
    - _Requirements: 13.4_
  
  - [ ] 16.8 Write property tests for racing
    - **Property 42: Racing time trial ranking**
    - **Property 43: Racing grand prix accumulation**
    - **Property 44: Racing knockout elimination**
    - **Property 45: F1 session structure**
    - **Property 46: F1 championship accumulation**
    - **Validates: Requirements 12.1, 12.2, 12.3, 13.1, 13.2**
  
  - [ ] 16.9 Create racing configuration panels
    - Build separate panels for MK and F1 modes
    - Add mode-specific controls
    - Follow SolidJS patterns
    - _Requirements: 12.5, 13.5, 18.2_
  
  - [ ] 16.10 Create racing visualizers
    - Build leaderboard component for time trials
    - Build race results and standings tables
    - Build championship standings with per-race breakdown
    - Show progression for knockout and playoff formats
    - _Requirements: 12.1, 12.2, 12.4, 13.2, 13.3_
  
  - [ ] 16.11 Register racing formats
    - Create and register MK and F1 formats
    - _Requirements: 17.1, 17.2, 17.3_

- [ ] 17. Integrate visualization into builder
  - [ ] 17.1 Create main visualizer component
    - Build SolidJS component that switches on format type
    - Use `<Switch>/<Match>` for format-specific visualizers
    - Lazy load visualizers with `<Suspense>`
    - _Requirements: 2.4, 18.2_
  
  - [ ] 17.2 Connect visualizer to state
    - Subscribe to tournament structure memo
    - Update only when structure changes (fine-grained reactivity)
    - _Requirements: 2.4, 15.3, 15.4_
  
  - [ ] 17.3 Add export/import buttons to builder
    - Add buttons to builder UI
    - Wire up to export/import utilities
    - Show success/error feedback
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 18. Implement responsive design
  - [ ] 18.1 Add responsive breakpoints to visualizers
    - Adjust bracket layouts for tablet and mobile
    - Stack tables vertically on small screens
    - Simplify connectors on mobile
    - _Requirements: 1.5_
  
  - [ ] 18.2 Test responsive behavior
    - Verify layouts at different breakpoints
    - Ensure touch interactions work on mobile
    - _Requirements: 1.5_

- [ ] 19. Add accessibility features
  - [ ] 19.1 Add ARIA labels to interactive elements
    - Label all buttons, inputs, and regions
    - Add role attributes where appropriate
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ] 19.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Add focus management for modals
    - Add skip links
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ] 19.3 Add screen reader announcements
    - Use live regions for dynamic updates
    - Announce participant additions/removals
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 20. Implement error handling
  - [ ] 20.1 Add error boundaries to islands
    - Wrap each island in `<ErrorBoundary>`
    - Provide fallback UI with retry
    - _Requirements: 5.3_
  
  - [ ] 20.2 Add validation to forms
    - Validate participant names
    - Validate configuration values
    - Show inline error messages
    - _Requirements: 3.1, 5.3_
  
  - [ ] 20.3 Add error handling to import
    - Show friendly error messages for invalid files
    - Offer recovery options
    - _Requirements: 5.3_

- [ ] 21. Optimize performance
  - [ ] 21.1 Configure code splitting
    - Set up manual chunks for formats
    - Lazy load heavy visualizers
    - _Requirements: 15.1, 15.2_
  
  - [ ] 21.2 Optimize UnoCSS
    - Remove unused utilities with blocklist
    - Narrow scan targets
    - _Requirements: 18.3_
  
  - [ ] 21.3 Add virtual scrolling for large lists
    - Implement for participant lists with 100+ items
    - _Requirements: 15.3, 15.4_

- [ ] 22. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Polish and deployment preparation
  - [ ] 23.1 Add dark mode toggle
    - Implement class-based dark mode with SolidJS
    - Persist preference to local storage
    - _Requirements: 14.3_
  
  - [ ] 23.2 Add loading states
    - Show spinners for lazy-loaded components
    - Add skeleton screens where appropriate
    - _Requirements: 2.4_
  
  - [ ] 23.3 Configure build for production
    - Set up Astro build configuration
    - Configure Vite optimizations
    - Verify bundle size < 100KB
    - _Requirements: 15.1, 18.4_
  
  - [ ] 23.4 Test offline functionality
    - Verify app works after initial load with network disabled
    - Test local storage persistence
    - _Requirements: 16.3, 16.5_
  
  - [ ] 23.5 Write property tests for architecture requirements
    - **Property 47: No external network calls**
    - **Property 48: Offline functionality**
    - **Property 49: Format registration**
    - **Property 50: Format interface compliance**
    - **Property 51: Dynamic format card generation**
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.5**
