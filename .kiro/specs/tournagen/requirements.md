# Requirements Document

## Introduction

TournaGen is a static tournament generator web application designed to help organizers create, visualize, and manage various tournament formats entirely in the browser. The application targets hobby sports leagues, esports communities, school tournaments, and online events, providing an intuitive interface for building tournament structures without requiring technical expertise or backend infrastructure.

## Glossary

- **TournaGen**: The tournament generator web application system
- **Tournament Format**: A specific competitive structure (e.g., single elimination, round robin, Swiss)
- **Participant**: An individual or team competing in a tournament
- **Bracket**: A tree-like visual representation showing match progression in elimination formats
- **Round**: A set of matches that occur at the same stage of a tournament
- **Stage**: A distinct phase of a tournament (e.g., group stage, knockout stage)
- **Advancement Connector**: Visual lines or arrows showing how participants progress between rounds or stages
- **Seeding**: The process of ranking and placing participants to ensure balanced matchups
- **Bye**: A situation where a participant advances without playing due to uneven numbers
- **Island**: A SolidJS component with client-side interactivity embedded in an Astro page
- **Configuration Panel**: The interactive interface for setting tournament parameters
- **Export**: Downloading tournament configuration as a JSON file
- **Import**: Loading a previously saved tournament configuration from a JSON file

## Requirements

### Requirement 1: Landing Page

**User Story:** As a tournament organizer, I want to understand what TournaGen offers and choose the right tournament format, so that I can quickly start building my tournament.

#### Acceptance Criteria

1. WHEN a user visits the landing page THEN TournaGen SHALL display a hero section explaining the core value proposition with a clear call-to-action
2. WHEN a user views the formats section THEN TournaGen SHALL display visually consistent cards for each tournament type with titles, explanations, and iconic visuals
3. WHEN a user reviews format information THEN TournaGen SHALL provide "when to use this" guidance for each format including typical participant counts and duration
4. WHEN a user views the landing page THEN TournaGen SHALL present static preview diagrams for brackets, schedules, and leaderboards
5. WHEN a user accesses the landing page on different devices THEN TournaGen SHALL display a responsive layout optimized for desktop and tablet with graceful mobile degradation

### Requirement 2: Tournament Builder Interface

**User Story:** As a tournament organizer, I want a guided interface to configure my tournament step-by-step, so that I can create a complete tournament structure without confusion.

#### Acceptance Criteria

1. WHEN a user starts building a tournament THEN TournaGen SHALL display a stepwise configuration flow with clear progress indication
2. WHEN a user completes a configuration step THEN TournaGen SHALL allow navigation back to previous steps to modify settings
3. WHEN a user configures tournament options THEN TournaGen SHALL provide format-specific controls for rounds, group sizes, seeding, and scoring rules
4. WHEN a user changes configuration settings THEN TournaGen SHALL update the tournament visualization in real-time using fine-grained reactivity
5. WHEN a user views complex tournament structures THEN TournaGen SHALL display clear labels for rounds and stages with distinct visual styles

### Requirement 3: Participant Management

**User Story:** As a tournament organizer, I want to easily add, edit, and organize participants, so that I can maintain an accurate roster for my tournament.

#### Acceptance Criteria

1. WHEN a user adds a participant THEN TournaGen SHALL accept the input and update the participant list immediately
2. WHEN a user edits a participant name inline THEN TournaGen SHALL update only the affected UI elements using fine-grained reactivity
3. WHEN a user removes a participant THEN TournaGen SHALL delete the participant and update the tournament structure accordingly
4. WHEN a user reorders participants THEN TournaGen SHALL update the seeding and bracket positions to reflect the new order
5. WHEN a user adds optional participant fields THEN TournaGen SHALL support seeding ranks, team names, nationality, and format-specific attributes

### Requirement 4: Visual Progression and Connecting Lines

**User Story:** As a tournament organizer, I want to see clear visual connections showing how participants advance through the tournament, so that I can understand the tournament flow at a glance.

#### Acceptance Criteria

1. WHEN a user views bracket-style formats THEN TournaGen SHALL display connecting lines between matches showing which match feeds into which next-round match
2. WHEN a user views formats with byes THEN TournaGen SHALL visually indicate bye positions with clear connecting lines showing how participants skip rounds
3. WHEN a user views group-to-knockout formats THEN TournaGen SHALL display advancement lines from group tables to specific knockout bracket slots with labels
4. WHEN a user views multi-stage formats THEN TournaGen SHALL show progression arrows between stages indicating how participants advance
5. WHEN a user views connecting lines THEN TournaGen SHALL see subtle but clear visual connectors with consistent stroke style, color, and thickness

### Requirement 5: Import and Export

**User Story:** As a tournament organizer, I want to save my tournament configuration and load it later, so that I can preserve my work and share tournaments with others.

#### Acceptance Criteria

1. WHEN a user clicks the export button THEN TournaGen SHALL generate a JSON file containing the complete tournament configuration and trigger a browser download
2. WHEN a user clicks the import button THEN TournaGen SHALL prompt for a file selection and load the tournament configuration into memory
3. WHEN a user imports an invalid file THEN TournaGen SHALL display a friendly error message explaining what went wrong and offer recovery options
4. WHEN a user exports a tournament THEN TournaGen SHALL create a human-readable JSON structure with clear field names and organization
5. WHEN a user closes and reopens the application THEN TournaGen SHALL optionally restore the most recent tournament from browser local storage

### Requirement 6: Single Elimination Tournament

**User Story:** As a tournament organizer, I want to create a single elimination bracket where losers are immediately eliminated, so that I can run a fast-paced knockout event.

#### Acceptance Criteria

1. WHEN a user selects single elimination THEN TournaGen SHALL automatically determine the number of rounds based on participant count
2. WHEN the participant count is not a power of two THEN TournaGen SHALL visually indicate byes in the bracket with clear explanations
3. WHEN a user views the bracket THEN TournaGen SHALL display a tree-like structure with labeled rounds and clean bracket lines showing match progression
4. WHEN a user enables third-place playoff THEN TournaGen SHALL add a match between losing semifinalists to the bracket
5. WHEN a user configures seeding THEN TournaGen SHALL support random placement, seeded placement, and optional manual adjustment of matchups

### Requirement 7: Double Elimination Tournament

**User Story:** As a tournament organizer, I want to create a double elimination bracket where participants are eliminated after two losses, so that I can provide a more forgiving competitive format.

#### Acceptance Criteria

1. WHEN a user selects double elimination THEN TournaGen SHALL display both winners bracket and losers bracket with clear visual separation
2. WHEN a participant loses in the winners bracket THEN TournaGen SHALL show connector lines indicating where they drop into the losers bracket
3. WHEN a user views the grand final THEN TournaGen SHALL clearly represent the potential bracket reset scenario if enabled
4. WHEN a user configures the format THEN TournaGen SHALL support options for participants starting in the losers bracket
5. WHEN a user enables the reset rule THEN TournaGen SHALL visually distinguish the conditional reset match in the grand final

### Requirement 8: Round Robin Tournament

**User Story:** As a tournament organizer, I want to create a league-style format where everyone plays everyone, so that I can ensure fair competition over multiple matches.

#### Acceptance Criteria

1. WHEN a user selects round robin THEN TournaGen SHALL generate a schedule where each pair of participants meets the specified number of times
2. WHEN a user views the tournament THEN TournaGen SHALL display standings tables with played, wins, draws, losses, and points
3. WHEN a user views the schedule THEN TournaGen SHALL show fixtures grouped by rounds with clear organization
4. WHEN a user configures multiple groups THEN TournaGen SHALL display separate tables and fixtures for each group
5. WHEN a user sets up groups feeding into playoffs THEN TournaGen SHALL show visual connectors indicating which positions advance to the knockout bracket

### Requirement 9: Swiss Tournament

**User Story:** As a tournament organizer, I want to create a Swiss format where participants play others with similar performance, so that I can rank a large field efficiently.

#### Acceptance Criteria

1. WHEN a user selects Swiss format THEN TournaGen SHALL generate pairings for a fixed number of rounds based on current scores
2. WHEN a user views round pairings THEN TournaGen SHALL group participants by score and avoid repeat matchups where possible
3. WHEN a user completes a round THEN TournaGen SHALL update the standings table with accumulated points and tiebreak details
4. WHEN a user configures the format THEN TournaGen SHALL support customizable points for wins, draws, losses, and byes
5. WHEN a user views the tournament THEN TournaGen SHALL display clear round-by-round pairings with progression indicators

### Requirement 10: Free-for-All Tournament

**User Story:** As a tournament organizer, I want to create matches where multiple participants compete simultaneously, so that I can run battle royale or party game tournaments.

#### Acceptance Criteria

1. WHEN a user selects FFA format THEN TournaGen SHALL create matches with a configurable maximum number of participants per lobby
2. WHEN a user configures advancement THEN TournaGen SHALL support defining how many top performers advance from each match
3. WHEN a user views the tournament THEN TournaGen SHALL display a stage-by-stage overview with match blocks showing participants
4. WHEN a user views advancing participants THEN TournaGen SHALL highlight them with badges, color-coding, or placement indicators
5. WHEN a user views stage progression THEN TournaGen SHALL show connecting arrows between stages indicating how the field narrows over time

### Requirement 11: FIFA-Style Tournament

**User Story:** As a tournament organizer, I want to create football tournament structures combining group play with knockout stages, so that I can replicate World Cup or Champions League formats.

#### Acceptance Criteria

1. WHEN a user selects FIFA-style format THEN TournaGen SHALL support configurable group stages with round robin play
2. WHEN a user configures advancement THEN TournaGen SHALL define how many teams advance from each group and their seeding into the knockout bracket
3. WHEN a user views group tables THEN TournaGen SHALL display points, matches played, wins, draws, losses, goal difference, and goals scored
4. WHEN a user views the knockout bracket THEN TournaGen SHALL show labeled rounds with clear mapping from group positions to bracket slots
5. WHEN a user configures knockout settings THEN TournaGen SHALL support single matches or two-legged ties with aggregate scoring options

### Requirement 12: Racing Tournament - Mario Kart Style

**User Story:** As a tournament organizer, I want to create Mario Kart tournaments with time trials, grand prix, or elimination formats, so that I can organize racing events.

#### Acceptance Criteria

1. WHEN a user selects time trial mode THEN TournaGen SHALL rank participants by fastest times with clear leaderboards showing deltas from the leader
2. WHEN a user selects grand prix mode THEN TournaGen SHALL support multiple races with points awarded per finishing position and cumulative standings
3. WHEN a user selects knockout cup mode THEN TournaGen SHALL eliminate lowest-placed participants after each race until reaching the final
4. WHEN a user views knockout progression THEN TournaGen SHALL clearly mark eliminated participants and show visual connectors for advancing racers
5. WHEN a user configures scoring THEN TournaGen SHALL support customizable points per finishing position

### Requirement 13: Racing Tournament - F1 Style

**User Story:** As a tournament organizer, I want to create F1-style events with qualifying, races, and championship seasons, so that I can organize realistic motorsport competitions.

#### Acceptance Criteria

1. WHEN a user selects single Grand Prix THEN TournaGen SHALL support separate qualifying and race sessions with qualifying setting the starting grid
2. WHEN a user selects championship season THEN TournaGen SHALL track cumulative driver and optional team standings across multiple races
3. WHEN a user views season standings THEN TournaGen SHALL display per-race results and championship points tables
4. WHEN a user selects playoff format THEN TournaGen SHALL support qualifying heats feeding into semifinals and finals with clear progression lines
5. WHEN a user configures races THEN TournaGen SHALL support labeling circuits, sprint races, and customizable points systems

### Requirement 14: Visual Design System

**User Story:** As a user, I want a modern, clean, and beautiful interface with consistent visual design, so that the application is pleasant to use and easy to understand.

#### Acceptance Criteria

1. WHEN a user views any page THEN TournaGen SHALL apply consistent typography with clear hierarchy for headings and body text
2. WHEN a user views interactive elements THEN TournaGen SHALL display consistent spacing, padding, and margins following a defined rhythm
3. WHEN a user views buttons and cards THEN TournaGen SHALL apply a consistent color and elevation system with clear primary and secondary actions
4. WHEN a user views tournament visualizations THEN TournaGen SHALL ensure brackets and tables are legible with appropriate font sizes and spacing
5. WHEN a user views connecting lines THEN TournaGen SHALL render them with consistent stroke style, color, and thickness that fits the visual language

### Requirement 15: Performance and Hydration

**User Story:** As a user, I want the application to load quickly and respond instantly to my interactions, so that I can work efficiently without delays.

#### Acceptance Criteria

1. WHEN a user loads a page THEN TournaGen SHALL minimize shipped JavaScript by defaulting to static rendering
2. WHEN a user interacts with the tournament builder THEN TournaGen SHALL hydrate only the interactive islands using Astro hydration directives
3. WHEN a user modifies configuration or participants THEN TournaGen SHALL update only affected UI elements using SolidJS fine-grained reactivity
4. WHEN a user changes a single participant THEN TournaGen SHALL avoid re-rendering the entire participant list or tournament visualization
5. WHEN a user views informational content THEN TournaGen SHALL serve it as static HTML without client-side JavaScript

### Requirement 16: Client-Side Architecture

**User Story:** As a user, I want the application to work entirely in my browser without requiring accounts or internet connectivity, so that I can use it privately and reliably.

#### Acceptance Criteria

1. WHEN a user accesses TournaGen THEN the system SHALL execute all logic, scheduling, and bracket generation in the browser
2. WHEN a user saves data THEN TournaGen SHALL use file-based export or browser local storage without external API calls
3. WHEN a user works offline THEN TournaGen SHALL maintain full functionality after initial page load
4. WHEN a user's data is processed THEN TournaGen SHALL keep all tournament information local to the browser session
5. WHEN a user closes the browser THEN TournaGen SHALL optionally persist recent work to local storage for convenience

### Requirement 17: Modular Architecture for Extensibility

**User Story:** As a developer, I want the tournament system to be modular and extensible, so that new tournament formats can be added easily without modifying existing code.

#### Acceptance Criteria

1. WHEN a developer adds a new tournament format THEN TournaGen SHALL support registration without modifying core tournament builder logic
2. WHEN a tournament format is implemented THEN TournaGen SHALL define a common interface for configuration, visualization, and export
3. WHEN the system renders tournament formats THEN TournaGen SHALL use a plugin-like architecture where each format provides its own components
4. WHEN a developer creates format-specific logic THEN TournaGen SHALL isolate it in dedicated modules separate from shared utilities
5. WHEN the landing page displays formats THEN TournaGen SHALL dynamically generate format cards from a registry without hardcoding each format

### Requirement 18: Technical Stack Compliance

**User Story:** As a developer, I want the codebase to follow modern best practices for TypeScript, Astro, SolidJS, and UnoCSS, so that the application is maintainable, performant, and follows established patterns.

#### Acceptance Criteria

1. WHEN TypeScript code is written THEN TournaGen SHALL use strict mode with discriminated unions and proper type safety
2. WHEN SolidJS components are created THEN TournaGen SHALL use fine-grained reactivity with signals and stores without destructuring props
3. WHEN styles are applied THEN TournaGen SHALL use UnoCSS with static class strings and shortcuts for design system consistency
4. WHEN components are hydrated THEN TournaGen SHALL use strategic client directives to minimize shipped JavaScript
5. WHEN the application is built THEN TournaGen SHALL follow the patterns and guidelines specified in the project documentation
