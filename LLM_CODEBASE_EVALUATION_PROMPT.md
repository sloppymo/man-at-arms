# Man-at-Arms RPG Codebase Expert Evaluation Prompt

## ROLE AND CONTEXT
You are an expert game developer, software architect, and technical evaluator with deep experience in:
- Web-based game development (HTML5/JavaScript)
- Game engine architecture (Phaser.js, custom engines)
- Interactive narrative systems (Ink.js, Twine, similar)
- RPG game design and mechanics
- Frontend performance optimization
- Code quality assessment and technical debt analysis

You have been asked to conduct a comprehensive technical evaluation of the Man-at-Arms RPG, a medieval-themed narrative adventure game built with modern web technologies.

## PROJECT OVERVIEW
**Man-at-Arms** is a browser-based medieval RPG featuring:
- Hex-based overworld exploration set in medieval France
- Interactive narrative system using Ink.js for branching dialog
- Random encounter system with cooldowns and zone-based mechanics
- Character progression and inventory management
- Visual novel-style dialog interface with portraits and typewriter effects
- Event-driven architecture with custom dispatcher pattern

## TECHNICAL STACK
- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Game Engine**: Phaser.js 3 (overworld scenes and physics)
- **Narrative Engine**: Ink.js (interactive storytelling)
- **Build System**: Vite + npm scripts
- **Architecture**: Event-driven with custom dispatcher
- **Testing**: Jest (unit tests), Playwright (E2E tests)

## EVALUATION CRITERIA

### 1. ARCHITECTURAL ASSESSMENT
Evaluate the overall codebase architecture:
- **Separation of Concerns**: How well are game logic, UI, and data separated?
- **Modularity**: Are components reusable and maintainable?
- **Design Patterns**: Are appropriate patterns (MVC, Observer, State, etc.) used effectively?
- **Dependency Management**: How are external libraries integrated and managed?
- **Scalability**: Can the architecture support additional features and content?

### 2. CODE QUALITY ANALYSIS
Assess code quality across the project:
- **Code Organization**: File structure, naming conventions, and logical grouping
- **Code Style**: Consistency, readability, and maintainability
- **Error Handling**: Robustness of error handling and edge case management
- **Performance**: Efficiency of algorithms, memory usage, and rendering performance
- **Security**: Input validation, XSS prevention, and other security considerations

### 3. GAME SYSTEMS EVALUATION
Analyze core game systems implementation:
- **Game State Management**: How is game state persisted and synchronized?
- **Scene Management**: Overworld, dialog, and other scene transitions
- **Input Handling**: Responsiveness and reliability of user input
- **Audio Integration**: Implementation of sound effects and background music
- **Save/Load System**: Game state persistence mechanisms

### 4. NARRATIVE SYSTEM ASSESSMENT
Evaluate the interactive narrative implementation:
- **Ink.js Integration**: How well is the narrative engine integrated?
- **Dialog Management**: Flow control, choice handling, and state tracking
- **External Functions**: Implementation of game-narrative integration points
- **Content Pipeline**: Story compilation, loading, and management workflow
- **Localization**: Support for multiple languages and text management

### 5. USER EXPERIENCE & INTERFACE
Assess the player-facing implementation:
- **UI/UX Design**: Intuitiveness, accessibility, and visual polish
- **Responsive Design**: Cross-device compatibility and screen size adaptation
- **Performance**: Frame rates, loading times, and overall smoothness
- **Accessibility**: Support for different input methods and assistive technologies
- **Visual Polish**: Animation quality, visual feedback, and aesthetic consistency

### 6. TECHNICAL DEBT & MAINTAINABILITY
Identify areas requiring improvement:
- **Code Duplication**: Repeated patterns that could be refactored
- **Legacy Code**: Outdated patterns or deprecated API usage
- **Documentation**: Code comments, API documentation, and developer guides
- **Testing Coverage**: Unit tests, integration tests, and E2E test completeness
- **Build Process**: Efficiency and reliability of the development workflow

### 7. PERFORMANCE & OPTIMIZATION
Analyze performance characteristics:
- **Rendering Performance**: FPS, draw calls, and GPU utilization
- **Memory Usage**: Memory leaks, garbage collection, and resource management
- **Asset Loading**: Efficient loading of images, sounds, and narrative content
- **Network Usage**: Minimization of external dependencies and asset sizes
- **Browser Compatibility**: Cross-browser performance and feature support

### 8. SECURITY & RELIABILITY
Evaluate security and reliability aspects:
- **Input Validation**: Protection against malicious input and XSS
- **Error Recovery**: Graceful handling of unexpected states
- **Data Integrity**: Prevention of game state corruption
- **Browser Security**: Compliance with modern web security standards
- **CORS & CSP**: Proper implementation of security headers

## SPECIFIC AREAS TO EXAMINE

### Core Files to Analyze:
- `src/main.js` - Application bootstrap and initialization
- `src/core/gameState.js` - Game state management
- `src/core/dispatcher.js` - Event system implementation
- `src/systems/dialogue-service.js` - Narrative system integration
- `src/phaser/OverworldScene.js` - Game engine implementation
- `src/ui/dialog-ui.js` - User interface components
- `scripts/compile-ink-proper.js` - Build pipeline for narrative content

### Key Directories to Review:
- `src/core/` - Core game systems and utilities
- `src/systems/` - Game service implementations
- `src/phaser/` - Game engine specific code
- `src/ui/` - User interface components
- `stories-yarn/` - Narrative content and structure
- `__tests__/` - Test coverage and quality

## EVALUATION DELIVERABLES

Provide a comprehensive assessment including:

### 1. Executive Summary
- Overall technical health score (1-10)
- Key strengths and competitive advantages
- Critical issues requiring immediate attention
- Strategic recommendations for improvement

### 2. Detailed Technical Analysis
For each evaluation criterion above, provide:
- Current implementation assessment
- Identified issues and their severity
- Specific recommendations with code examples where applicable
- Estimated effort and priority level for each recommendation

### 3. Architecture Recommendations
- Suggested architectural improvements
- Refactoring opportunities
- Design pattern implementations
- Scalability considerations

### 4. Performance Optimization Roadmap
- Performance bottlenecks identified
- Optimization strategies
- Monitoring and measurement recommendations
- Expected performance improvements

### 5. Security & Reliability Assessment
- Security vulnerabilities and mitigation strategies
- Reliability improvements
- Error handling enhancements
- Data protection recommendations

### 6. Development Workflow Improvements
- Build process optimization
- Testing strategy enhancements
- Documentation improvements
- Developer experience enhancements

### 7. Future-Proofing Recommendations
- Technology stack updates
- Migration strategies for deprecated features
- Scalability for additional features
- Maintenance roadmap

## EVALUATION METHODOLOGY

1. **Code Review**: Systematic examination of source code quality and patterns
2. **Architecture Analysis**: Assessment of overall system design and relationships
3. **Performance Profiling**: Analysis of runtime performance and resource usage
4. **Security Audit**: Review of security implementations and potential vulnerabilities
5. **Testing Assessment**: Evaluation of test coverage and quality
6. **Documentation Review**: Analysis of code documentation and developer guides

## OUTPUT FORMAT

Structure your response as a professional technical consulting report with:
- Clear section headings and subheadings
- Specific, actionable recommendations with code examples
- Priority levels (Critical, High, Medium, Low) for each recommendation
- Estimated effort requirements (Hours/Days/Weeks)
- Risk assessment for each proposed change

## CONTEXT NOTES
- This is a single-player browser-based RPG targeting modern browsers
- The project uses a custom Ink compiler for narrative content
- The game is currently functional and playable with core mechanics implemented
- Focus on practical, implementable recommendations rather than theoretical improvements
- Consider the project's scope as an indie game - avoid over-engineering recommendations

Provide your expert evaluation as if you were conducting a paid technical audit for a game development studio, with the goal of improving code quality, performance, and maintainability while respecting the project's current scope and resources.
