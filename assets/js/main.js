(function() {
	// Year in footer
	var y = document.getElementById('y');
	if (y) y.textContent = new Date().getFullYear();

	// Countdown
	var cd = document.querySelector('[data-countdown]');
	if (!cd) return;
	var start = cd.getAttribute('data-start');
	var target = start ? new Date(start) : null;
	if (!target) return;

	function pad(n) { return String(n).padStart(2, '0'); }

	function tick() {
		var now = new Date();
		var diff = target.getTime() - now.getTime();
		if (diff < 0) diff = 0;

		var sec = Math.floor(diff / 1000);
		var days = Math.floor(sec / 86400); sec -= days * 86400;
		var hrs  = Math.floor(sec / 3600); sec -= hrs * 3600;
		var min  = Math.floor(sec / 60); sec -= min * 60;

		var dd = cd.querySelector('[data-dd]');
		var hh = cd.querySelector('[data-hh]');
		var mm = cd.querySelector('[data-mm]');
		var ss = cd.querySelector('[data-ss]');

		if (dd) dd.textContent = pad(days);
		if (hh) hh.textContent = pad(hrs);
		if (mm) mm.textContent = pad(min);
		if (ss) ss.textContent = pad(sec);
	}

	tick();
	setInterval(tick, 1000);
})();


