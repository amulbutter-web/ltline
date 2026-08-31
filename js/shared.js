/**
 * Smart LT - Shared Application Logic
 * Defines global namespaces, utility functions, mock data service, and UI controllers.
 */

// Global Namespace
window.SmartLT = {
  data: null,
  config: {
    updateInterval: 2000,
    sections: 8,
    nominalVoltage: 415,
    nominalCurrent: 45,
    nominalFrequency: 50,
  },
  nav: null,
  utils: {}
};

/* ==========================================================================
   Utility Functions
   ========================================================================== */
window.SmartLT.utils = {
  // Animate a number from current to target with smooth transition
  animateNumber(element, target, duration = 800, decimals = 1) {
    if (!element) return;
    
    let startTimestamp = null;
    const initialValue = parseFloat(element.innerText.replace(/[^0-9.-]+/g, "")) || 0;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentVal = initialValue + (target - initialValue) * easeProgress;
      element.innerText = currentVal.toFixed(decimals);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  },
  
  // Format timestamp
  formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour12: false });
  },
  
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },
  
  formatRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return `${Math.floor(diff / 3600)} hr ago`;
  },
  
  // Intersection Observer
  observeElements(selector, callback, options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    document.querySelectorAll(selector).forEach(el => observer.observe(el));
    return observer;
  },
  
  initScrollAnimations() {
    this.observeElements('[data-animate]', (el) => {
      el.classList.add('slt-animate-in');
    });
  },
  
  setupCanvas(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    return { ctx, width: rect.width, height: rect.height, dpr };
  },
  
  lerp(a, b, t) {
    return a + (b - a) * t;
  },
  
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },
  
  mapRange(val, inMin, inMax, outMin, outMax) {
    return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  },
  
  uid() {
    return Math.random().toString(36).substring(2, 9);
  },
  
  debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  
  throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

/* ==========================================================================
   Data Service (Mock Data Generation)
   ========================================================================== */
class DataService {
  constructor() {
    this.mode = 'demo'; 
    this.subscribers = [];
    this.lastUpdate = new Date();
    this.systemStatus = 'normal'; 
    this.sections = [];
    this.events = [];
    this.historicalData = { voltage: [], current: [], frequency: [], health: [] };
    this.uptime = 99.98;
    this._intervalId = null;
    this.init();
  }
  
  init() {
    this.generateInitialSections();
    this.generateInitialHistory();
    this._intervalId = setInterval(() => this._updateMockData(), window.SmartLT.config.updateInterval);
  }
  
  generateInitialSections() {
    const { sections, nominalVoltage, nominalCurrent, nominalFrequency } = window.SmartLT.config;
    for (let i = 0; i < sections; i++) {
      this.sections.push({
        id: `SEC-${(i + 1).toString().padStart(2, '0')}`,
        index: i,
        voltage: nominalVoltage + this._gaussian(0, 1),
        current: nominalCurrent + this._gaussian(0, 0.5),
        frequency: nominalFrequency + this._gaussian(0, 0.01),
        health: 98 + Math.random() * 2,
        status: 'normal',
        isolated: false,
        lastUpdate: new Date(),
        loadPercentage: 40 + Math.random() * 40
      });
    }
  }
  
  generateInitialHistory() {
    // Generate 50 points of history for charts
    const now = Date.now();
    for (let i = 50; i >= 0; i--) {
      const t = now - (i * window.SmartLT.config.updateInterval);
      this._pushHistoryPoint(t);
    }
  }
  
  _pushHistoryPoint(timestamp = Date.now()) {
    const { nominalVoltage, nominalCurrent, nominalFrequency } = window.SmartLT.config;
    
    // Aggregate values across non-isolated sections
    let totalV = 0, totalI = 0, totalF = 0, totalH = 0, count = 0;
    
    this.sections.forEach(sec => {
      if (!sec.isolated) {
        totalV += sec.voltage;
        totalI += sec.current;
        totalF += sec.frequency;
        totalH += sec.health;
        count++;
      }
    });
    
    if (count > 0) {
      this.historicalData.voltage.push({ t: timestamp, y: totalV / count });
      this.historicalData.current.push({ t: timestamp, y: totalI / count });
      this.historicalData.frequency.push({ t: timestamp, y: totalF / count });
      this.historicalData.health.push({ t: timestamp, y: totalH / count });
      
      // Keep last 100 points to prevent memory leak
      if (this.historicalData.voltage.length > 100) {
        this.historicalData.voltage.shift();
        this.historicalData.current.shift();
        this.historicalData.frequency.shift();
        this.historicalData.health.shift();
      }
    }
  }
  
  _updateMockData() {
    const { nominalVoltage, nominalCurrent, nominalFrequency } = window.SmartLT.config;
    
    let hasFault = false;
    let hasWarning = false;
    let isolatedCount = 0;
    
    this.sections.forEach(sec => {
      if (!sec.isolated) {
        // Add random walk
        sec.voltage = window.SmartLT.utils.clamp(sec.voltage + this._gaussian(0, 0.5), nominalVoltage - 10, nominalVoltage + 10);
        sec.current = window.SmartLT.utils.clamp(sec.current + this._gaussian(0, 0.2), nominalCurrent - 5, nominalCurrent + 15);
        sec.frequency = window.SmartLT.utils.clamp(sec.frequency + this._gaussian(0, 0.005), nominalFrequency - 0.2, nominalFrequency + 0.2);
        
        // Randomly degrade health slightly or recover
        sec.health = window.SmartLT.utils.clamp(sec.health + this._gaussian(0, 0.2), 60, 100);
        
        // Update load based on current
        sec.loadPercentage = (sec.current / (nominalCurrent + 15)) * 100;
        
        // Status determination based on thresholds
        if (sec.status !== 'fault' && sec.status !== 'isolated') {
            if (Math.abs(sec.voltage - nominalVoltage) > 8 || sec.health < 80) {
              sec.status = 'warning';
              hasWarning = true;
            } else {
              sec.status = 'normal';
            }
        }
      }
      
      if (sec.status === 'fault') hasFault = true;
      if (sec.status === 'isolated') isolatedCount++;
      
      sec.lastUpdate = new Date();
    });
    
    // Overall system status
    if (hasFault) this.systemStatus = 'fault';
    else if (isolatedCount > 0) this.systemStatus = 'protected';
    else if (hasWarning) this.systemStatus = 'abnormal';
    else this.systemStatus = 'normal';
    
    this.lastUpdate = new Date();
    this._pushHistoryPoint(this.lastUpdate.getTime());
    
    // Occasionally simulate random minor events (approx every 60 updates)
    if (Math.random() < 0.015) {
       this._addEvent('info', 'System Optimizer', 'Minor load rebalancing completed automatically.');
    }
    
    this._notifySubscribers();
  }
  
  _addEvent(type, title, description, sectionId = null) {
    this.events.unshift({
      id: window.SmartLT.utils.uid(),
      timestamp: new Date(),
      type, // 'info', 'warning', 'fault', 'success'
      title,
      description,
      sectionId
    });
    
    if (this.events.length > 200) this.events.pop();
  }
  
  getSystemStatus() {
    let totalH = 0;
    let count = 0;
    let faultCount = 0;
    let warningCount = 0;
    
    this.sections.forEach(s => {
      if (!s.isolated) {
        totalH += s.health;
        count++;
      }
      if (s.status === 'fault') faultCount++;
      if (s.status === 'warning') warningCount++;
    });
    
    return {
      status: this.systemStatus,
      health: count > 0 ? totalH / count : 0,
      uptime: this.uptime,
      activeDevices: count,
      totalSections: this.sections.length,
      isolatedSections: this.sections.filter(s => s.isolated).length,
      activeFaults: faultCount,
      activeAlerts: faultCount + warningCount,
      communication: 'connected',
      lastUpdate: this.lastUpdate,
      mode: this.mode
    };
  }
  
  getSections() { return this.sections; }
  
  getSection(id) { return this.sections.find(s => s.id === id); }
  
  getEvents(filters = {}) {
    let result = [...this.events];
    if (filters.type) result = result.filter(e => e.type === filters.type);
    if (filters.sectionId) result = result.filter(e => e.sectionId === filters.sectionId);
    return result;
  }
  
  getHistorical(metric, range = '1h') {
    return this.historicalData[metric] || [];
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }
  
  _notifySubscribers() {
    const data = {
      system: this.getSystemStatus(),
      sections: this.getSections()
    };
    this.subscribers.forEach(cb => {
      try { cb(data); } catch (e) { console.error("Error in subscriber callback", e); }
    });
  }
  
  triggerFaultSimulation(sectionIndex = 2) {
    if (sectionIndex < 0 || sectionIndex >= this.sections.length) return;
    
    const sec = this.sections[sectionIndex];
    if (sec.isolated || sec.status === 'fault') return; // Already faulted
    
    console.log(`[SIMULATION] Triggering fault on ${sec.id}`);
    
    // Step 1: Immediate Fault
    sec.status = 'fault';
    sec.voltage = 0;
    sec.current = window.SmartLT.config.nominalCurrent * 3; // Spike
    sec.health = 20;
    this.systemStatus = 'fault';
    this._addEvent('fault', 'Critical Voltage Drop Detected', `Phase sequence error and voltage drop on ${sec.id}`, sec.id);
    this._notifySubscribers();
    
    // Step 2: Identification (1s)
    setTimeout(() => {
      this._addEvent('warning', 'Automated Protection Triggered', `Initiating isolation protocols for ${sec.id}`, sec.id);
      this._notifySubscribers();
    }, 1000);
    
    // Step 3: Isolation (2.5s)
    setTimeout(() => {
      sec.status = 'isolated';
      sec.isolated = true;
      sec.current = 0;
      this.systemStatus = 'protected';
      this._addEvent('success', 'Section Isolated Successfully', `${sec.id} has been physically disconnected from the main bus.`, sec.id);
      this._notifySubscribers();
    }, 2500);
    
    // Step 4: System Stable (4s)
    setTimeout(() => {
      this._addEvent('info', 'System Rebalanced', `Load redistributed. Operating in degraded but stable mode.`, null);
      this._notifySubscribers();
    }, 4000);
    
    // Step 5: Auto-Recovery / Reset Simulation (15s)
    setTimeout(() => {
      sec.isolated = false;
      sec.status = 'normal';
      sec.voltage = window.SmartLT.config.nominalVoltage;
      sec.current = window.SmartLT.config.nominalCurrent;
      sec.health = 95;
      this.systemStatus = 'normal';
      this._addEvent('success', 'Simulation Reset', `${sec.id} restored to nominal operating parameters.`, sec.id);
      this._notifySubscribers();
    }, 15000);
  }
  
  getConnectionState() {
    return this.mode;
  }
  
  // Box-Muller transform for pseudo-gaussian random numbers
  _gaussian(mean = 0, stdev = 1) {
    const u = 1 - Math.random(); 
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return z * stdev + mean;
  }
}

/* ==========================================================================
   Navigation Controller
   ========================================================================== */
class SLTNavigation {
  constructor() {
    this.navEl = document.querySelector('.slt-nav');
    this.mobileToggle = document.querySelector('.slt-mobile-toggle');
    this.mobileMenu = document.querySelector('.slt-mobile-menu');
    this.links = document.querySelectorAll('.slt-nav-links a');
    
    this.init();
  }
  
  init() {
    this.highlightActive();
    this.bindEvents();
    this.handleScroll();
  }
  
  highlightActive() {
    const path = window.location.pathname;
    this.links.forEach(link => {
      const href = link.getAttribute('href');
      // Simple path matching
      if (path.endsWith(href) || (path.endsWith('/') && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  bindEvents() {
    if (this.mobileToggle && this.mobileMenu) {
      this.mobileToggle.addEventListener('click', () => {
        this.mobileMenu.classList.toggle('is-open');
        this.mobileToggle.innerHTML = this.mobileMenu.classList.contains('is-open') ? '✕' : '☰';
      });
      
      // Close menu when clicking a link
      const mobileLinks = this.mobileMenu.querySelectorAll('a');
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.mobileMenu.classList.remove('is-open');
          this.mobileToggle.innerHTML = '☰';
        });
      });
    }
    
    window.addEventListener('scroll', window.SmartLT.utils.throttle(this.handleScroll.bind(this), 100), { passive: true });
  }
  
  handleScroll() {
    if (!this.navEl) return;
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      this.navEl.style.background = 'rgba(8, 10, 13, 0.95)';
      this.navEl.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    } else {
      this.navEl.style.background = 'rgba(8, 10, 13, 0.85)';
      this.navEl.style.boxShadow = 'none';
    }
  }
}

/* ==========================================================================
   UI Components
   ========================================================================== */
class SLTStatusBar {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (this.container) {
      this.render();
      this.timeEl = this.container.querySelector('.slt-status-time');
    }
  }
  
  render() {
    this.container.innerHTML = `
      <div class="slt-flex-between" style="padding: 1rem 0; border-bottom: 1px solid var(--slt-border); margin-bottom: 2rem;">
        <div class="slt-demo-indicator">
          <div class="slt-status-dot"></div>
          DEMO MODE
        </div>
        <div class="slt-status-time slt-mono slt-micro" style="color: var(--slt-text-tertiary);">
          LAST UPDATED: JUST NOW
        </div>
      </div>
    `;
  }
  
  update(dataService) {
    if (this.timeEl && dataService) {
      const timeStr = window.SmartLT.utils.formatRelativeTime(dataService.lastUpdate);
      this.timeEl.textContent = `LAST UPDATED: ${timeStr.toUpperCase()}`;
    }
  }
}

class SLTFooter {
  static render(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = `
      <footer class="slt-footer">
        <div class="slt-container">
          <div class="slt-footer-grid">
            <div class="slt-footer-brand">
              <a href="index.html" class="slt-logo">SMART LT</a>
              <p class="slt-footer-desc">Next-generation industrial electrical monitoring and protection system.</p>
            </div>
            <div>
              <h4 class="slt-footer-title">Platform</h4>
              <ul class="slt-footer-links">
                <li><a href="monitoring.html">Live Monitoring</a></li>
                <li><a href="analytics.html">Analytics</a></li>
                <li><a href="events.html">Event Logs</a></li>
                <li><a href="#">Topology</a></li>
              </ul>
            </div>
            <div>
              <h4 class="slt-footer-title">Resources</h4>
              <ul class="slt-footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 class="slt-footer-title">System</h4>
              <ul class="slt-footer-links">
                <li><a href="#">Settings</a></li>
                <li><a href="#">Access Control</a></li>
                <li><a href="#">Diagnostics</a></li>
              </ul>
            </div>
          </div>
          <div class="slt-footer-bottom">
            <span>&copy; ${new Date().getFullYear()} Smart LT Systems. All rights reserved.</span>
            <span>Version 2.4.1</span>
          </div>
        </div>
      </footer>
    `;
  }
}

/* ==========================================================================
   Auto-Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Init utils
  window.SmartLT.utils.initScrollAnimations();
  
  // Init Navigation
  window.SmartLT.nav = new SLTNavigation();
  
  // Render Footer if container exists
  if (document.getElementById('slt-footer-container')) {
    SLTFooter.render('#slt-footer-container');
  }
  
  // Init Data Service
  window.SmartLT.data = new DataService();
  
  // Init Status Bar if container exists
  const statusBarContainer = document.getElementById('slt-status-bar-container');
  if (statusBarContainer) {
    const statusBar = new SLTStatusBar('#slt-status-bar-container');
    
    // Subscribe status bar to updates
    window.SmartLT.data.subscribe(() => {
      statusBar.update(window.SmartLT.data);
    });
  }
});
