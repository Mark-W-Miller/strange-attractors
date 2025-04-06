Strange Attractors - Interface Guide

Main Interface Components

Canvas Container

The main gameplay area containing four layered canvases:
	•	EGF Canvas: Displays the Einstein Gravity Floor grid.
	•	Terrain Canvas: Overlays obstacles and terrain.
	•	AUT Canvas: Shows automatons and cursor visuals.
	•	gameCanvas (Overlay Div): Captures mouse events for interaction.

Control Bar

Located at the bottom of the screen, the Control Bar provides tools and settings for gameplay.

Controls Available:
	•	Layers Visible: Checkboxes for toggling visibility of layers (EGF, Terrain, AUT).
	•	Edit Mode: Dropdown to select which layer to edit (EGF, Terrain, AUT).
	•	Brush Shape: Dropdown to choose cursor shape (Circle, Square).
	•	Terrain Type: Dropdown to select the type of terrain placed.
	•	Debug Toggle: Checkbox to enable or disable detailed debugging logs.
	•	Debug Classes: Scrollable list of checkboxes for detailed debug logging by class.
	•	Add AUT Button: Adds new automatons to the gameplay field.

Mouse Interactions
	•	Mouse Move: Updates the visual cursor on the AUT canvas.
	•	Mouse Click/Drag: Applies edits to cells based on selected mode, brush shape, and cursor size.
	•	Mouse Wheel: Adjusts cursor size dynamically.

Editing Logic
	•	Mass Edit: Adjusts multiple cells at once, determined by cursor size and selected brush shape (circle or square).

Debugging Interface
	•	Utilizes the DB system for categorized debugging output, viewable through the browser console.
	•	Debug output includes cursor positions, edits applied, and internal state changes.

This guide details interaction methods and interface components for gameplay and debugging.