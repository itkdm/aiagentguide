import re

css = open('docs/.vitepress/theme/styles/home.css', encoding='utf-8').read()

# remove previous attempt
css = re.sub(r'\.dark \.VPContent\.is-home \.VPHome\s*\{[^}]+\}', '', css)

spotlight = """
/* Bottom Spotlight for Dark Home Page */
html.dark .VPContent.is-home::before {
  content: "";
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 60vh;
  background: radial-gradient(
    ellipse 80% 100% at 50% 100%, 
    rgba(56, 189, 248, 0.25) 0%,
    rgba(139, 92, 246, 0.15) 30%,
    rgba(15, 23, 42, 0) 70%
  );
  pointer-events: none;
  z-index: 0; /* Keep it below content */
}

html.dark body:has(.is-home) {
  --vp-c-bg: #030712; /* Deep modern dark blue */
  background-color: var(--vp-c-bg);
}

/* Give the spotlight a cool sweeping effect */
@keyframes sweepLight {
  0%   { transform: translateX(-5%) scale(1.05); opacity: 0.8; }
  50%  { transform: translateX(5%) scale(0.95); opacity: 1; }
  100% { transform: translateX(-5%) scale(1.05); opacity: 0.8; }
}

html.dark .VPContent.is-home::after {
  content: "";
  position: fixed;
  bottom: -10vh;
  left: -20vw;
  width: 140vw;
  height: 40vh;
  background: radial-gradient(
    ellipse 60% 100% at 50% 100%, 
    rgba(56, 189, 248, 0.15) 0%,
    rgba(139, 92, 246, 0.05) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  animation: sweepLight 8s ease-in-out infinite;
}

"""

with open('docs/.vitepress/theme/styles/home.css', 'w', encoding='utf-8') as f:
    f.write(css + "\n" + spotlight)

print("Done")
