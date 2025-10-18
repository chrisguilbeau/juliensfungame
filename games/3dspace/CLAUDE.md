# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

3D Space Fighter is a multiplayer space combat game inspired by classic vector graphics games like the original Star Wars arcade game. Built with vanilla JavaScript, HTML5 Canvas, and CSS, it features split-screen gameplay with retro green/magenta vector graphics styling.

## Development Commands

- **Run Game**: Open `index.html` in a web browser
- **Run Tests**: Open `test.html` in a web browser to see unit test results

## Architecture

### Core Components

- **vector3d.js**: 3D vector math and rendering engine
  - `Vector3D` class for 3D coordinates and operations  
  - `Renderer3D` class for projecting 3D points to 2D canvas
- **ship.js**: Game entities (ships and projectiles)
  - `Ship` class with physics, weapons, and collision detection
  - `Projectile` class for laser shots
- **controls.js**: Input handling for dual-player keyboard controls
  - `InputManager` for keyboard state tracking
  - `Controls` class mapping keys to ship actions
- **game.js**: Main game loop and state management
  - `Game` class coordinating all systems
  - Split-screen rendering with independent cameras

### Game Mechanics

- **Controls**: 
  - Player 1: WASD (move), Q/E (rotate), Space (fire)
  - Player 2: Arrow keys (move), ,/. (rotate), Enter (fire)
- **Physics**: Momentum-based movement with thrust and friction
- **Combat**: 5 lives per player, projectile and collision damage
- **3D Space**: Ships can move in full 3D with boundary wrapping

### Styling

Vector graphics aesthetic with green (#0f0) and magenta (#f0f) color scheme on black background, using Courier New font for retro computer terminal feel.

## Configuration

The repository includes Claude Code permissions configuration in `.claude/settings.local.json` that allows specific bash commands for file operations.