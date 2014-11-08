# Extreme Energy Combat

Units use large amounts of energy while fighting.

This mod is part of the Dynamic Energy experiment.  Right now in vanilla metal and energy feel kind of the same.

## Indictments

### Most energy is spent to spend metal.

Fabricators and factories are the biggest energy consumers.  Both of these things are already limited by metal usage.  Attacking either resource has exactly the same effect: the player's build rate slows. 

This mod expects that construction costs will be reduced, but does not include those adjustments itself.  Or you could play a super energy-tight game.

### Demand is constant.

Factories are always on and fabbers are usually fabbing.  Storage is a mostly forgotten vestige of the TA heritage; a player who builds one in competitive play gets asked about the unusual move in interviews.

This mod adds a significant energy drain for units and combat.  In practice with the systems available this means the ammo system applied across the board, as well as recon and nukes.

Compromises: units are limited to one ammo weapon.  Some units had to be switched to alternating fire, and units with independent turrets have a fixed maintenance cost instead of ammo.  (Unfortunately the game allows you to turn them off; the unit's vision has been tied to power so there is some penalty for doing this.)

## Development

The generated project includes a `package.json` that lists the dependencies, but you'll need to run `npm install` to download them.

PA will upload **all files** in the mod directory, including `node_modules` and maybe even `.git` - you probably don't want to use this in `server_mods` directly, unless you really like waiting.  The template is set up run to run as a project within a peer directory of `server_mods` - I use `server_mods_dev/mod_name`.  The task `grunt copy:mod` will copy the mod files to `../../server_mods/identifier`, you can change the `modPath` in the Gruntfile if you want to run it from somewhere else.

### Available Tasks

- copy:mod - copy the mod files into server_mods
- proc - Proc: read one or more files from PA and munge into one in the mod.
- default: proc, copy:mod
