Strange Attractors - Project Summary

Overview

Strange Attractors is a 2D browser-based strategic digital-art game where players program and manage automatons (AUTs) that interact dynamically within a layered environment. Gameplay currently supports single-player against AI-controlled automatons, with planned expansion to multiplayer/team gameplay.

Game Structure

Layers

The game comprises two explicit layers:
	•	Einstein’s Gravity Floor (EGF): A foundational 2D grid of cells with Attraction-Repulsion Values (ARVs) that affect automaton movements:
	•	Negative ARV (dark): reduces movement cost.
	•	Positive ARV (bright): increases movement cost.
	•	Neutral ARV (grey): standard movement cost.
	•	Texture Layer (TERRAIN): A visual strategic overlay representing obstacles or terrains that influence automaton paths. TERRAIN cells exactly align with multiples of EGF cells.

Automatons (AUTs)

Types
	1.	Particle AUT (Basic Unit):
	•	Defined by direction (0–7) and energy (movement per turn).
	2.	Spirit Force AUT (Composite Unit):
	•	Composed of multiple Particle AUTs.
	•	Governed by explicit Spirit Force Logic (Perception → Decision → Execution → Feedback).

Configuration (gridConfig.json)
	•	Defines grid dimensions, terrain scaling, opacity, default ARV values, and grid line colors.

UI Structure
	•	Canvas Container: Contains layered canvases (EGF, Terrain, AUT, gameCanvas) managed with CSS and JavaScript for proper alignment and dynamic resizing.
	•	Control Bar: Allows selection of visible layers, editing modes, brush shapes, terrain types, and debug toggles.
	•	Editing Interaction: Mouse movements handle cursor visualization, clicks and drags apply edits based on cursor shape (circle/square) and adjustable cursor size via mouse wheel.

Debugging
	•	Uses the DB class (DB.js) for detailed, categorized logging (e.g., MSE for mouse events, DRAW for drawing).

Drawing Pipeline
	•	Ensures explicit alignment and square cells when resizing.
	•	Utilizes efficient dirty-cell optimization and layered rendering.

Immediate Next Steps (for Next Session)
	•	Review this summary first (from GIT).
	•	Verify complete alignment robustness after resizing events.
	•	Confirm proper functioning of brush size adjustments and immediate cursor redraw on wheel events.
	•	Refine Spirit Force Logic definitions explicitly.
	•	Maintain detailed debug logging for interactions and rendering cycles.