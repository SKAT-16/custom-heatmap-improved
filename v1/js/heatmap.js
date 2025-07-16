(function () {
  const getSessionId = () => {
    let sid = localStorage.getItem('heatmap_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('heatmap_session_id', sid);
    }
    return sid;
  };

  const query = new URLSearchParams(window.location.search);
  const showHeatmap = query.get('heatmap') === 'true';

  // Early exit: skip all tracking if heatmap is shown
  if (!showHeatmap) {
    const urlPath = window.location.pathname;
    const screen = { width: window.innerWidth, height: window.innerHeight };
    const startTime = Date.now();
    let clickTimestamps = [];
    let scrollDepth = 0;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY + window.innerHeight; // Total scrolled area
      const total = document.body.scrollHeight; // Entire page height
      const percent = Math.min(Math.max(Math.round((scrolled / total) * 100), 0), 100); // Limit to between 0 and 100%
      scrollDepth = percent;

      // Send scroll data to the server
      fetch("http://localhost/custom-heatmap/api/track.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: getSessionId(),
          event: "scroll",
          xPercent: 0.5,  // You can keep this static if you're tracking scroll on the Y axis
          yPercent: scrollDepth / 100, // Normalized to between 0 and 1
          url: urlPath,
          screen,
          timestamp: new Date().toISOString()
        })
      });
    });

    window.addEventListener('beforeunload', () => {
      const timeSpent = (Date.now() - startTime) / 1000;
      // Ensure scroll depth is within valid bounds
      const validScrollDepth = Math.min(Math.max(scrollDepth, 0), 100); // Keep scrollDepth between 0 and 100%

      navigator.sendBeacon("http://localhost/custom-heatmap/api/track.php", JSON.stringify({
        session_id: getSessionId(),
        event: "session_end",
        scrollDepth: validScrollDepth,
        timeSpent,
        url: urlPath,
        screen,
        timestamp: new Date().toISOString()
      }));
    });


    document.addEventListener("click", function (e) {
      const now = Date.now();
      clickTimestamps = clickTimestamps.filter(t => now - t < 1000);
      clickTimestamps.push(now);
      const isRageClick = clickTimestamps.length >= 3;
      fetch("http://localhost/custom-heatmap/api/track.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: getSessionId(),
          event: isRageClick ? "rage_click" : "click",
          xPercent: Math.max(0, Math.min(1, e.pageX / document.documentElement.scrollWidth)),
          yPercent: Math.max(0, Math.min(1, e.pageY / document.documentElement.scrollHeight)),
          url: urlPath,
          screen,
          timestamp: new Date().toISOString()
        })
      });
    });


    document.querySelectorAll("*").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const rect = el.getBoundingClientRect();
        fetch("http://localhost/custom-heatmap/api/track.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: getSessionId(),
            event: "hover",
            tag: el.tagName,
            xPercent: Math.max(0, Math.min(1, (rect.left + rect.width / 2 + window.scrollX) / document.documentElement.scrollWidth)),
            yPercent: Math.max(0, Math.min(1, (rect.top + rect.height / 2 + window.scrollY) / document.documentElement.scrollHeight)),
            url: urlPath,
            screen,
            timestamp: new Date().toISOString()
          })
        });
      });
    });
  }

  // If heatmap mode is active, load and display the visualization
  if (showHeatmap) {
    const typeMap = {
      click: query.get('clicks') === 'true',
      rage_click: query.get('rage') === 'true',
      hover: query.get('hovers') === 'true',
      scroll: false, //query.get('scrolls') === 'true',
      session_end: false, //query.get('engagement') === 'true'
    };

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.maxHeight = "100%";
    overlay.style.zIndex = "9999";
    overlay.style.pointerEvents = "none";
    document.body.appendChild(overlay);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.0/heatmap.min.js";
    script.onload = () => {
      const urlPath = window.location.pathname;
      const pageWidth = document.documentElement.scrollWidth;
      const pageHeight = document.documentElement.scrollHeight;

      const gradientMap = {
        click: { 0.4: 'rgba(255,0,0,0.3)', 1: 'red' },
        rage_click: { 0.4: 'rgba(128,0,128,0.3)', 1: 'purple' },
        hover: { 0.4: 'rgba(0,0,255,0.3)', 1: 'blue' },
        scroll: { 0.4: 'rgba(0,255,0,0.3)', 1: 'green' },
        session_end: { 0.4: 'rgba(255,165,0,0.3)', 1: 'orange' }
      };

      const heatmapLayers = {};

      Object.entries(typeMap).forEach(([type, enabled]) => {
        if (!enabled) return;

        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";  // Ensure this fills the page correctly
        container.style.maxHeight = "100%";
        overlay.appendChild(container);


        const heatmap = h337.create({
          container,
          radius: 40,
          maxOpacity: 0.6,
          minOpacity: 0.1,
          blur: 0.85,
          gradient: gradientMap[type]
        });

        fetch(`http://localhost/custom-heatmap/api/heatmap-data.php?url=${encodeURIComponent(urlPath)}&types=${type}`)
          .then(res => res.json())
          .then(data => {
            const points = data.points.map(p => ({
              x: Math.round(Math.max(0, Math.min(pageWidth, p.xPercent * pageWidth))),
              y: Math.round(Math.max(0, Math.min(pageHeight, p.yPercent * pageHeight))),
              value: 1
            }));
            heatmap.setData({ max: 5, data: points });
          });

        heatmapLayers[type] = container;
      });

      // UI Panel
      const panel = document.createElement('div');
      panel.style.position = 'fixed';
      panel.style.top = '20px';
      panel.style.right = '20px';
      panel.style.zIndex = '10000';
      panel.style.background = 'rgba(255, 255, 255, 0.95)';
      panel.style.border = '1px solid #ccc';
      panel.style.borderRadius = '8px';
      panel.style.padding = '10px';
      panel.style.fontFamily = 'sans-serif';
      panel.style.fontSize = '14px';
      panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      panel.innerHTML = '<strong>Heatmap Layers</strong><br>';
      document.body.appendChild(panel);

      const paramMap = {
        click: 'clicks',
        rage_click: 'rage',
        hover: 'hovers',
        scroll: 'scrolls',
        session_end: 'engagement'
      };

      const colorMap = {
        click: 'red',
        rage_click: 'purple',
        hover: 'blue',
        scroll: 'green',
        session_end: 'orange'
      };

      Object.keys(paramMap).forEach(type => {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginTop = '5px';
        label.innerHTML = `
                    <input type="checkbox" ${typeMap[type] ? 'checked' : ''} data-type="${type}">
                    <span style="color:${colorMap[type]}; font-weight: bold;">${type.replace('_', ' ')}</span>
                `;
        panel.appendChild(label);

        const checkbox = label.querySelector('input');
        checkbox.addEventListener('change', () => {
          const param = paramMap[type];
          const newQuery = new URLSearchParams(window.location.search);

          if (checkbox.checked) {
            newQuery.set(param, 'true');
            if (heatmapLayers[type]) heatmapLayers[type].style.display = 'block';
          } else {
            newQuery.delete(param);
            if (heatmapLayers[type]) heatmapLayers[type].style.display = 'none';
          }

          const newUrl = `${window.location.pathname}?${newQuery.toString()}`;
          window.history.replaceState(null, '', newUrl);
        });
      });
      const summaryBtn = document.createElement('button');
      summaryBtn.textContent = '📄 Download Usage Summary';
      summaryBtn.style.marginTop = '10px';
      summaryBtn.style.padding = '6px';
      summaryBtn.style.cursor = 'pointer';
      summaryBtn.style.background = '#007bff';
      summaryBtn.style.color = '#fff';
      summaryBtn.style.border = 'none';
      summaryBtn.style.borderRadius = '4px';
      summaryBtn.onclick = () => {
        const summaryUrl = `http://localhost/custom-heatmap/api/summary-pdf.php?url=${encodeURIComponent(window.location.pathname)}`;
        window.open(summaryUrl, '_blank');
      };
      panel.appendChild(summaryBtn);
    };
    document.head.appendChild(script);
  }
})();
