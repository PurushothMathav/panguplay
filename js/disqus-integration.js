/**
 * Minimal Disqus implementation that bypasses the custom integration
 * and uses the recommended embed pattern directly
 */

// Remove any existing Disqus scripts to start fresh
document.addEventListener('DOMContentLoaded', function() {
  // Clear the existing Disqus thread div
  const disqusThread = document.getElementById('disqus_thread');
  if (disqusThread) {
    disqusThread.innerHTML = '';
    
    // Remove any existing Disqus scripts
    document.querySelectorAll('script[src*="disqus.com"]').forEach(script => {
      script.remove();
    });
    
    // Reset any Disqus variables that might be causing conflicts
    window.DISQUS = undefined;
    window.disqus_config = undefined;
    window.disqus_shortname = undefined;
    
    // Insert direct embed code
    const disqusConfig = document.createElement('script');
    disqusConfig.innerHTML = `
      var disqus_config = function() {
        this.page.url = "${window.location.href.split('?')[0].split('#')[0]}";
        this.page.identifier = "panguplay-discussions-${window.location.pathname.replace(/[^a-zA-Z0-9]/g, '-')}";
        this.page.title = "PanguPlay Community Discussions";
      };
    `;
    document.head.appendChild(disqusConfig);
    
    // Load the Disqus embed script using the recommended pattern
    const disqusEmbed = document.createElement('script');
    disqusEmbed.src = 'https://panguplay.disqus.com/embed.js';
    disqusEmbed.setAttribute('data-timestamp', +new Date());
    disqusEmbed.async = true;
    document.body.appendChild(disqusEmbed);
    
    // Add visible loading indicator while Disqus loads
    disqusThread.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #f9f9f9;">
        <p>Loading comments...</p>
        <div style="margin: 15px auto; width: 40px; height: 40px; border: 3px solid #e50914; border-radius: 50%; border-top-color: transparent; animation: disqus-spinner 1s linear infinite;"></div>
      </div>
      <style>
        @keyframes disqus-spinner {
          to {transform: rotate(360deg);}
        }
      </style>
    `;
    
    // Add error detection
    window.addEventListener('error', function(event) {
      if (event.target.src && event.target.src.indexOf('disqus.com') !== -1) {
        disqusThread.innerHTML = `
          <div style="text-align: center; padding: 20px; color: #f9f9f9;">
            <p>Unable to load comments. This might be due to:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;">- Ad blocker preventing Disqus</li>
              <li style="margin: 10px 0;">- Network connection issues</li>
              <li style="margin: 10px 0;">- Disqus service temporarily unavailable</li>
            </ul>
            <button onclick="location.reload();" style="background-color: #e50914; color: white; border: none; padding: 8px 16px; margin-top: 15px; border-radius: 4px; cursor: pointer;">Reload Page</button>
          </div>
        `;
      }
    }, true);
  }
});