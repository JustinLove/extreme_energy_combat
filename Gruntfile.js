var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.extreme_energy_combat/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

var power = 20

module.exports = function(grunt) {
  var readJSON = function(id) {
    var id_ex1 = id.replace('/pa/', '/pa_ex1/')
    if (grunt.file.exists(media + id_ex1)) {
      id = id_ex1
    }
    return grunt.file.readJSON(media + id)
  }

  var readAmmo = function(spec) {
    return readJSON(typeof(spec.ammo_id) == 'string' ? spec.ammo_id : spec.ammo_id[0].id)
  }

  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'com.wondible.pa.*/**',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
    },
    clean: ['pa', modPath],
    // copy files from PA, transform, and put into mod
    proc: {
      weapons: {
        targets: [
          'pa/units/**/*weapon*.json',
          'pa_ex1/units/**/*weapon*.json',
          // bug with multiple ammo weapons per unit
          '!pa*/units/commanders/base_commander/*.json',
          '!pa*/units/land/assault_bot_adv/assault_bot_adv_torpedo_tool_weapon.json',
          '!pa*/units/land/bot_sniper/bot_sniper_beam_tool_weapon.json',
          '!pa*/units/sea/destoryer/destoryer_tool_torpedo.json',
          '!pa*/units/sea/frigate/frigate_tool_weapon_torpedo.json',
          '!pa*/units/sea/frigate/frigate_tool_weapon_shell.json',
          '!pa*/units/sea/missile_ship/missile_ship_aa_tool_weapon.json',
          '!pa*/units/sea/nuclear_sub/nuclear_sub_tool_weapon.json',
          // projectiles_per_fire
          '!pa*/units/land/assault_bot/assault_bot_tool_weapon.json',
          '!pa*/units/land/tank_laser_adv/tank_laser_adv_tool_weapon.json',
          // others are used twice on the same unit and need special treatment
          '!pa*/units/air/gunship/gunship_tool_weapon.json',
          '!pa*/units/land/bot_grenadier/bot_grenadier_tool_weapon.json',
          // multiple actual turrets :-(
          '!pa*/units/land/titan_vehicle/titan_vehicle_tool_weapon*.json',
          '!pa*/units/orbital/defense_satellite/defense_satellite_tool_weapon.json',
          '!pa*/units/orbital/orbital_battleship/orbital_battleship_tool_weapon*.json',
          '!pa*/units/orbital/titan_orbital/titan_orbital_tool_weapon*.json',
          '!pa*/units/sea/battleship/battleship_tool_weapon.json',
          '!pa*/units/sea/destroyer/destroyer_tool_weapon.json',
          '!pa*/units/sea/hover_ship/hover_ship_tool_weapon*.json',
          // not a real weapon
          '!pa*/units/land/nuke_launcher/nuke_launcher_tool_weapon.json',
          '!pa*/units/land/anti_nuke_launcher/anti_nuke_launcher_tool_weapon.json',
          '!pa*/units/land/unit_cannon/unit_cannon_tool_weapon.json',
          '!pa*/units/land/titan_structure/titan_structure_tool_weapon.json',
          // costs metal
          '!pa*/units/land/artillery_unit_launcher/artillery_unit_launcher_tool_weapon.json',
          '!pa*/units/sea/drone_carrier/carrier/carrier_tool_weapon.json',
        ],
        process: function(spec) {
          if (spec.ammo_source == 'factory') return

          spec.start_fully_charged = false
          if (spec.ammo_capacity > 0) return

          var ammo = readAmmo(spec)
          var shot = ammo.damage * power
          var eps = spec.rate_of_fire * shot
          spec.ammo_capacity = shot * 3
          spec.ammo_demand = eps
          spec.ammo_per_shot = shot
          spec.ammo_source = 'energy'
        }
      },
      burst: {
        targets: [
          'pa_ex1/units/land/bot_tesla/bot_tesla_tool_weapon.json',
          'pa/units/air/bomber/bomber_tool_weapon.json',
          'pa_ex1/units/air/bomber_heavy/bomber_heavy_tool_weapon.json',
        ],
        process: function(spec) {
          spec.start_fully_charged = false
          spec.ammo_capacity *= power
          spec.ammo_demand *= power
          spec.ammo_per_shot *= power
        }
      },
      self_destruct: {
        targets: [
          'pa/units/land/bot_bomb/bot_bomb_tool_weapon.json',
        ],
        process: function(spec) {
          spec.start_fully_charged = false
          var ammo = readAmmo(spec)
          var shot = ammo.damage * power
          spec.ammo_capacity = shot
          spec.ammo_demand = shot / 10
          spec.ammo_per_shot = shot
          spec.ammo_source = 'energy'
        }
      },
      death: {
        targets: [
          'pa_ex1/units/land/tank_nuke/tank_nuke_tool_weapon.json',
        ],
        process: function(spec) {
          spec.start_fully_charged = false
          var ammo = readJSON('/pa_ex1/units/land/tank_nuke/tank_nuke_pbaoe.json')
          var shot = ammo.damage * power
          spec.ammo_capacity = shot
          spec.ammo_demand = shot / 10
          spec.ammo_per_shot = shot
          spec.ammo_source = 'energy'
        }
      },
      proj_weapons: {
        targets: [
          'pa/units/land/assault_bot/assault_bot_tool_weapon.json',
          'pa/units/land/tank_laser_adv/tank_laser_adv_tool_weapon.json'
        ],
        process: function(spec) {
          var ammo = readAmmo(spec)
          // all affected units are 2 currently. pipeline does not
          //   easily support referencing the unit and then writing the weapon
          var shot = ammo.damage * power * 2
          var eps = spec.rate_of_fire * shot
          spec.start_fully_charged = false
          spec.ammo_capacity = shot * 3
          spec.ammo_demand = eps
          spec.ammo_per_shot = shot
          spec.ammo_source = 'energy'
        }
      },
      double_weapons: {
        targets: [
          'pa/units/air/gunship/gunship_tool_weapon.json',
          'pa_ex1/units/land/bot_grenadier/bot_grenadier_tool_weapon.json',
        ],
        process: function(spec) {
          if (spec.ammo_source == 'factory') return

          spec.start_fully_charged = false
          if (spec.ammo_capacity > 0) return

          var ammo = readAmmo(spec)
          var shot = ammo.damage * 2 * power
          var eps = spec.rate_of_fire * shot
          spec.ammo_capacity = shot * 3
          spec.ammo_demand = eps
          spec.ammo_per_shot = shot
          spec.ammo_source = 'energy'
        }
      },
      double_ammo: {
        targets: [
          'pa/units/air/gunship/gunship_ammo.json',
          'pa/units/land/bot_grenadier/bot_grenadier_ammo.json',
        ],
        process: function(spec) {
          spec.damage *= 2
          if (spec.splash_damage) {
            spec.splash_damage *= 2
          }
        }
      },
      double_units: {
        targets: [
          'pa_ex1/units/air/gunship/gunship.json',
          'pa/units/land/bot_grenadier/bot_grenadier.json',
        ],
        process: function(spec) {
          var muzzle = [
            spec.tools[0].muzzle_bone,
            spec.tools[1].muzzle_bone
          ]
          spec.tools.pop()
          spec.tools[0].muzzle_bone = muzzle
        }
      },
      turret_units: {
        targets: [
          'pa_ex1/units/land/titan_vehicle/titan_vehicle.json',
          'pa_ex1/units/orbital/defense_satellite/defense_satellite.json',
          'pa_ex1/units/orbital/orbital_battleship/orbital_battleship.json',
          'pa_ex1/units/orbital/titan_orbital/titan_orbital.json',
          'pa/units/sea/battleship/battleship.json',
          'pa_ex1/units/sea/destroyer/destroyer.json',
          'pa_ex1/units/sea/hover_ship/hover_ship.json',
        ],
        process: function(spec) {
          var weapon_id = spec.tools[0].spec_id
          var weapon = readJSON(weapon_id)

          var ammo = readAmmo(weapon)
          var ppf = spec.tools[0].projectiles_per_fire || 1
          var shot = ammo.damage * spec.tools.length * ppf * power / 2
          var eps = weapon.rate_of_fire * shot
          spec.production = {
            "energy": -eps
          }
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

