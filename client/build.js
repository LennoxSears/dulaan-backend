#!/usr/bin/env node

/**
 * Build Script for Dulaan Browser Bundle
 * Combines all modular ES6 files into a single browser-compatible bundle
 */

const fs = require('fs');
const path = require('path');

// File order for bundling (dependencies first)
const FILES_TO_BUNDLE = [
    // 1. Constants and utilities first
    'utils/constants.js',
    'utils/audio-utils.js',
    
    // 2. Core components
    'core/motor-controller.js',
    'core/audio-processor.js',
    
    // 3. Services
    'services/api-service.js',
    'services/consent-service.js',
    'services/remote-service.js',
    
    // 4. Control modes
    'modes/ai-voice-control.js',
    'modes/ambient-control.js',
    'modes/touch-control.js',
    
    // 5. High-level modules
    'remote-control.js',
    
    // 6. Main SDK (last)
    'dulaan-sdk.js'
];

/**
 * Convert ES6 module to browser-compatible code
 */
function convertModuleToBrowser(content, filename) {
    let converted = content;
    
    // Remove import statements and collect them
    const imports = [];
    converted = converted.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, (match) => {
        imports.push(match);
        return ''; // Remove import
    });
    
    // Remove export statements but keep the declarations
    converted = converted.replace(/export\s+\{[^}]*\};?\s*/g, ''); // Remove export { ... }
    converted = converted.replace(/export\s+default\s+/g, ''); // Remove export default
    converted = converted.replace(/export\s+/g, ''); // Remove export keyword
    
    // Add comment header
    const header = `\n    // ============================================================================\n    // ${filename}\n    // ============================================================================\n\n`;
    
    return header + converted;
}

/**
 * Create the browser bundle
 */
function createBundle() {
    console.log('🔨 Building Dulaan Browser Bundle...');
    
    let bundleContent = `/**
 * Dulaan Browser Bundle - Auto-generated from modular sources
 * Generated on: ${new Date().toISOString()}
 * 
 * This file combines all modular ES6 files into a single browser-compatible bundle.
 * 
 * Source files:
${FILES_TO_BUNDLE.map(f => ` * - ${f}`).join('\n')}
 */

(function(window) {
    'use strict';

`;

    // Process each file
    for (const filePath of FILES_TO_BUNDLE) {
        const fullPath = path.join(__dirname, filePath);
        
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Warning: File not found: ${filePath}`);
            continue;
        }
        
        console.log(`📄 Processing: ${filePath}`);
        
        const content = fs.readFileSync(fullPath, 'utf8');
        const converted = convertModuleToBrowser(content, filePath);
        
        bundleContent += converted + '\n';
    }

    // Add bundle footer
    bundleContent += `
    // ============================================================================
    // Bundle Initialization
    // ============================================================================

    // Create global instance
    const dulaan = new DulaanSDK();

    // Initialize automatically
    dulaan.initialize().catch(console.error);

    // Export to global scope
    window.dulaan = dulaan;
    window.DulaanSDK = DulaanSDK;

    // Export individual components for advanced usage
    window.DULAAN_COMPONENTS = {
        MotorController,
        AudioProcessor,
        ApiService,
        ConsentService,
        RemoteService,
        RemoteControl,
        AIVoiceControl,
        AmbientControl,
        TouchControl,
        UTILS,
        REMOTE_CONFIG,
        AUDIO_CONFIG,
        PWM_CONFIG
    };

    console.log('🚀 Dulaan Browser Bundle loaded successfully');
    console.log('📦 Available components:', Object.keys(window.DULAAN_COMPONENTS));

})(window);
`;

    // Write the bundle
    const outputPath = path.join(__dirname, 'dulaan-browser-bundled.js');
    fs.writeFileSync(outputPath, bundleContent);
    
    console.log(`✅ Bundle created: ${outputPath}`);
    console.log(`📊 Bundle size: ${(bundleContent.length / 1024).toFixed(1)} KB`);
    
    // Create a backup of the old bundle
    const oldBundlePath = path.join(__dirname, 'dulaan-browser.js');
    if (fs.existsSync(oldBundlePath)) {
        const backupPath = path.join(__dirname, 'dulaan-browser-old.js');
        fs.copyFileSync(oldBundlePath, backupPath);
        console.log(`💾 Old bundle backed up to: dulaan-browser-old.js`);
    }
    
    return outputPath;
}

/**
 * Update HTML files to use the new bundle
 */
function updateHtmlFiles() {
    console.log('🔄 Updating HTML files...');
    
    const htmlFiles = [
        'remote-control-demo.html',
        'test-consent.html',
        'test-new-structure.html'
    ];
    
    for (const htmlFile of htmlFiles) {
        const htmlPath = path.join(__dirname, htmlFile);
        
        if (!fs.existsSync(htmlPath)) {
            console.warn(`⚠️  HTML file not found: ${htmlFile}`);
            continue;
        }
        
        let content = fs.readFileSync(htmlPath, 'utf8');
        
        // Replace old bundle reference with new one
        if (content.includes('dulaan-browser.js')) {
            content = content.replace(/dulaan-browser\.js/g, 'dulaan-browser-bundled.js');
            fs.writeFileSync(htmlPath, content);
            console.log(`✅ Updated: ${htmlFile}`);
        }
    }
}

// Main execution
if (require.main === module) {
    try {
        const bundlePath = createBundle();
        updateHtmlFiles();
        
        console.log('\n🎉 Build completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Test the new bundle in your HTML files');
        console.log('2. If everything works, replace dulaan-browser.js with dulaan-browser-bundled.js');
        console.log('3. Continue developing in the modular files (services/, core/, etc.)');
        console.log('4. Run this build script whenever you make changes');
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

module.exports = { createBundle, updateHtmlFiles };