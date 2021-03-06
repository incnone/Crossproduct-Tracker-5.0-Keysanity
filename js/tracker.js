(function(window) {
    'use strict';

    var query = uri_query();
	var is_keysanity = query.mode === 'keysanity';

    window.prizes = [];
    window.medallions = [0, 0];
    window.mode = query.mode;
    window.map_enabled = query.map;

    // Event of clicking on the item tracker
    window.toggle = function(label) {
        if (label.substring(0,5) === 'chest') {
            var value = items.dec(label);
            document.getElementById(label).className = 'chest-' + value;
            if (map_enabled) {
                var x = label.substring(5);
                document.getElementById('dungeon'+x).className = 'dungeon ' +
                    (value ? dungeons[x].can_get_chest() : 'opened');
            }
            return;
        }
		if (label.substring(0,8) === 'keychest') {
            var value = items.dec(label);
			if (value === 0) {
				document.getElementById(label).className = 'keychest-' + value;
				document.getElementById(label).innerHTML = '';
			} else {					
				document.getElementById(label).className = 'keychest';
				document.getElementById(label).innerHTML = value;
			}
			
            if (map_enabled) {
                var x = label.substring(8);
                document.getElementById('dungeon'+x).className = 'dungeon ' +
                    (value ? dungeons[x].can_get_chest() : 'opened');
            }
            return;
        }
		
		var skipkey = false;
		
		if (label.substring(0,6) === 'bigkey') {
			items[label] = !items[label];
			
			if (items[label]) {
				document.getElementById(label).className = 'bigkey collected';
			} else {
				document.getElementById(label).className = 'bigkey';
			}
			
			skipkey = true;
		}
		
		
		if (label.substring(0,12) === 'smallkeyhalf') {
			var value = items.inc(label);
			document.getElementById(label).innerHTML = value;
			skipkey = true;
        }		
		if (label.substring(0,8) === 'smallkey' && label.substring(0,12) != 'smallkeyhalf') {
			var value = items.inc(label);
			document.getElementById(label).innerHTML = value;
			skipkey = true;
        }
		
		if (!skipkey) {
		
			if (query.mode === 'keysanity' && (label === 'tunic' || label === 'sword' || label === 'shield')) {
				var node = document.getElementsByClassName(label)[1],
					is_boss = node.classList.contains('boss');
			} else {
				var node = document.getElementsByClassName(label)[0],
					is_boss = node.classList.contains('boss');
			}
			if ((typeof items[label]) === 'boolean') {
				items[label] = !items[label];
				node.classList[items[label] ? 'add' : 'remove'](is_boss ? 'defeated' : 'active');
			} else {
				var value = items.inc(label);
				node.className = node.className.replace(/ ?active-\w+/, '');
				if (value) node.classList.add('active-' + value);
			}
			// Initiate bunny graphics!
			if (label === 'moonpearl' || label === 'tunic') {
			   document.getElementsByClassName('tunic')[(query.mode === 'keysanity' ? 1 : 0)].classList[!items.moonpearl ? 'add' : 'remove']('bunny');
				//document.getElementsByClassName('tunic')[0].classList[!items.moonpearl ? 'add' : 'remove']('bunny');
			}
		}
        if (map_enabled) {
            for (var k = 0; k < chests.length; k++) {
                if (!chests[k].is_opened)
                    document.getElementById('chestMap'+k).className = 'chest ' + chests[k].is_available();
            }
            for (var k = 0; k < dungeons.length; k++) {
                if (!dungeons[k].is_beaten)
                    document.getElementById('bossMap'+k).className = 'boss ' + dungeons[k].is_beatable();
				if (query.mode === 'keysanity') {
					if (items['keychest'+k])
						document.getElementById('dungeon'+k).className = 'dungeon ' + dungeons[k].can_get_chest();
				} else {
					if (items['chest'+k] || k == 10)
						document.getElementById('dungeon'+k).className = 'dungeon ' + dungeons[k].can_get_chest();
				}

			}
            // Clicking a boss on the tracker will check it off on the map!
            if (is_boss) {
                toggle_boss(label.substring(4));
            }
            if (label === 'agahnim' || label === 'cape' || label === 'sword' || label === 'lantern' || label === 'smallkeyhalf1') {
                toggle_agahnim();
            }
        }
    };

    // event of clicking on a boss's pendant/crystal subsquare
    window.toggle_dungeon = function(n) {
        prizes[n] += 1;
		if (prizes[n] == 1 && !is_keysanity) prizes[n] = 2;
        else if (prizes[n] === 6) prizes[n] = 0;

        document.getElementById('dungeonPrize'+n).className = 'prize-' + prizes[n];

        if (map_enabled) {
            // Update Sahasralah, Fat Fairy, and Master Sword Pedestal
            var pendant_chests = [25, 61, 62];
            for (var k = 0; k < pendant_chests.length; k++) {
                if (!chests[pendant_chests[k]].is_opened)
                    document.getElementById('chestMap'+pendant_chests[k]).className = 'chest ' + chests[pendant_chests[k]].is_available();
            }
        }
    };

    // event of clicking on Mire/TRock's medallion subsquare
    window.toggle_medallion = function(n) {
        medallions[n] += 1;
        if (medallions[n] === 4) medallions[n] = 0;

        document.getElementById('medallion'+n).className = 'medallion-' + medallions[n];

        if (map_enabled) {
            // Update availability of dungeon boss AND chests
            dungeons[8+n].is_beaten = !dungeons[8+n].is_beaten;
            toggle_boss(8+n);
            if (items['chest'+(8+n)] > 0)
                document.getElementById('dungeon'+(8+n)).className = 'dungeon ' + dungeons[8+n].can_get_chest();
            // TRock medallion affects Mimic Cave
            if (n === 1) {
                chests[4].is_opened = !chests[4].is_opened;
                toggle_chest(4);
            }
            // Change the mouseover text on the map
            dungeons[8+n].caption = dungeons[8+n].caption.replace(/\{medallion\d+\}/, '{medallion'+medallions[n]+'}');
        }
    };


    // event of clicking on each dungeon's bigkey
    window.toggle_bigkey = function(n) {
		items['bigkey'+n] = !items['bigkey'+n];
		
		if (items['bigkey'+n]) {
			document.getElementById('bigkey'+n).className = 'bigkey collected';
		} else {
			document.getElementById('bigkey'+n).className = 'bigkey';
		}
		
        if (map_enabled) {
            // Update availability of dungeon boss AND chests
            dungeons[8+n].is_beaten = !dungeons[8+n].is_beaten;
            toggle_boss(8+n);
            if (items['chest'+(8+n)] > 0)
                document.getElementById('dungeon'+(8+n)).className = 'dungeon ' + dungeons[8+n].can_get_chest();
            // TRock medallion affects Mimic Cave
            if (n === 1) {
                chests[4].is_opened = !chests[4].is_opened;
                toggle_chest(4);
            }
            // Change the mouseover text on the map
            dungeons[8+n].caption = dungeons[8+n].caption.replace(/\{medallion\d+\}/, '{medallion'+medallions[n]+'}');
        }
    };

    if (map_enabled) {
        // Event of clicking a chest on the map
        window.toggle_chest = function(x) {
            chests[x].is_opened = !chests[x].is_opened;
            var highlight = document.getElementById('chestMap'+x).classList.contains('highlight');
            document.getElementById('chestMap'+x).className = 'chest ' +
                (chests[x].is_opened ? 'opened' : chests[x].is_available()) +
                (highlight ? ' highlight' : '');
        };
        // Event of clicking a dungeon location (not really)
        window.toggle_boss = function(x) {
            dungeons[x].is_beaten = !dungeons[x].is_beaten;
            document.getElementById('bossMap'+x).className = 'boss ' +
                (dungeons[x].is_beaten ? 'opened' : dungeons[x].is_beatable());
        };
        window.toggle_agahnim = function() {
            document.getElementById('castle').className = 'castle ' +
                (items.agahnim ? 'opened' : agahnim.is_available());
        };
        // Highlights a chest location and shows the caption
        window.highlight = function(x) {
            document.getElementById('chestMap'+x).classList.add('highlight');
            document.getElementById('caption').innerHTML = caption_to_html(chests[x].caption);
        };
        window.unhighlight = function(x) {
            document.getElementById('chestMap'+x).classList.remove('highlight');
            document.getElementById('caption').innerHTML = '&nbsp;';
        };
        // Highlights a chest location and shows the caption (but for dungeons)
        window.highlight_dungeon = function(x) {
            document.getElementById('dungeon'+x).classList.add('highlight');
            document.getElementById('caption').innerHTML = caption_to_html(dungeons[x].caption);
        };
        window.unhighlight_dungeon = function(x) {
            document.getElementById('dungeon'+x).classList.remove('highlight');
            document.getElementById('caption').innerHTML = '&nbsp;';
        };
        window.highlight_agahnim = function() {
            document.getElementById('castle').classList.add('highlight');
            document.getElementById('caption').innerHTML = caption_to_html(agahnim.caption);
        };
        window.unhighlight_agahnim = function() {
            document.getElementById('castle').classList.remove('highlight');
            document.getElementById('caption').innerHTML = '&nbsp;';
        };
    }

    function caption_to_html(caption) {
        return caption.replace(/\{(\w+?)(\d+)?\}/g, function(__, name, n) {
            var dash = /medallion|pendant/.test(name)
            return '<div class="icon ' +
                (dash ? name + '-' + n :
                n ? name + ' active-' + n :
                name) + '"></div>';
        });
    }

    window.start = function() {
		for (var k = 0; k < dungeons.length; k++) {
			prizes[k] = 0;
		}

        if (mode === 'standard') {
            document.getElementsByClassName('sword')[0].classList.add('active-1');
        }

        if (map_enabled) {
            for (k = 0; k < chests.length; k++) {
                document.getElementById('chestMap'+k).className = 'chest ' + (chests[k].is_opened ? 'opened' : chests[k].is_available());
            }
            document.getElementById('bossMapAgahnim').className = 'boss';
            document.getElementById('castle').className = 'castle ' + agahnim.is_available();
            for (k = 0; k < dungeons.length; k++) {
                document.getElementById('bossMap'+k).className = 'boss ' + dungeons[k].is_beatable();
                document.getElementById('dungeon'+k).className = 'dungeon ' + dungeons[k].can_get_chest();
            }
        } else {
            document.getElementById('app').classList.add('mapless');
            document.getElementById('map').style.display = 'none';
        }
		
		if (window.mode === 'keysanity') {
			document.getElementById('normalopen0').className = 'keysanityhidden';
			document.getElementById('normalopen1').className = 'keysanityhidden';
			document.getElementById('normalopen2').className = 'keysanityhidden';
			document.getElementById('normalopen3').className = 'keysanityhidden';
			document.getElementById('normalopenitems').className = 'keysanityhidden';
			document.getElementById('keysanity0').className = '';
			document.getElementById('keysanity1').className = '';
			document.getElementById('keysanity2').className = '';
			document.getElementById('keysanity3').className = '';
			document.getElementById('keysanityitems').className = '';
		} else {
			document.getElementById('chestMap65').style.visibility = 'hidden';
			document.getElementById('chestMap66').style.visibility = 'hidden';
			for (var k = 0; k < dungeons.length; k++) {
				toggle_dungeon(k);
			}
		}
				
    };
}(window));