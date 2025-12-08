document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration Data ---
    const artStyles = {
        'none': {
            desc: "Copy the image subject art style",
            neg: ""
        },
        '90s-anime': {
            desc: "Sharp 1990s anime-style shading, bold outlines, matte skin with subtle highlights, defined face structure, glowing eyes. Clean plain background. Centered composition, crisp focus, cinematic lighting, 8K NFT artwork, illustration",
            neg: "clothes, accessories, text, watermark, cartoonish, low-res, 3d, realistic"
        },
        'cyberpunk': {
            desc: "Hyper-realistic cyberpunk aesthetic, neon lighting, chrome accents, rainy atmosphere, high-tech interface overlays, detailed mechanical parts, moody lighting, futuristic city background, 8K resolution, unreal engine 5 render",
            neg: "blurry, grain, low quality, illustration, cartoon, anime, drawing, painting"
        },
        'synthwave': {
            desc: "Synthwave aesthetic, retro 80s futurism, neon sunsets, grid landscapes, chrome reflections, vibrant purples and oranges, sleek lines, outrun style, digital art",
            neg: "rustic, grunge, dirty, sketch, pencil, black and white, realistic, dull"
        },
        'pixel-8bit': {
            desc: "8-bit pixel art, retro nes style, limited color palette, blocky shapes, nostalgic gaming aesthetic, simple shading, arcade sprite, low resolution goodness",
            neg: "high resolution, anti-aliasing, vector, realistic, photo, 3d render, noise, smooth"
        },
        'pixel-16bit': {
            desc: "16-bit pixel art, snes style, vibrant colors, detailed sprites, pixel perfect, retro rpg aesthetic, clean dithering, arcade era",
            neg: "blur, vector, realistic, photo, 3d render, noise, modern graphics"
        },
        'pixel-32bit': {
            desc: "32-bit pixel art, playstation 1 era graphics, detailed pixel work, rich color depth, isometric perspective option, sharp edges, fighting game sprite style",
            neg: "blur, anti-aliasing, vector, realistic, photo, 3d render, noise"
        },
        'kids-drawing': {
            desc: "Child's drawing style, crayon texture, messy scribbles, vibrant primary colors, uneven lines, stick figure aesthetic, white paper background, naive art, whimsical and cute",
            neg: "professional, realistic, 3d, clean lines, digital art, perfectly proportional, photo"
        },
        '3d-render': {
            desc: "3D clay render, blender 3d style, isometric view, soft lighting, cute and rounded shapes, smooth textures, pastel color palette, subsurface scattering, ambient occlusion, high fidelity",
            neg: "2d, flat, drawing, sketch, anime, rough, low poly, pixelated"
        },
        'oil-painting': {
            desc: "Classical oil painting, texturized brushstrokes, dramatic chiaroscuro lighting, renaissance style, rich deep colors, canvas texture, detailed masterpiece, traditional art",
            neg: "digital, vector, cartoon, anime, 3d, photo, glossy, smooth, flat"
        },
        'vaporwave': {
            desc: "Vaporwave aesthetic, glitch art effects, vhs grain, pink and teal gradients, marble statue elements, retro computer graphics, surreal composition, dreamlike atmosphere",
            neg: "realistic, hd, 4k, clean, modern, minimal, rustic"
        },
        'graffiti': {
            desc: "Street art graffiti style, vibrant spray paint texture, drips and splatters, bold wildstyle outlines, urban wall background, edgy and colorful, hip hop culture vibe",
            neg: "clean, neat, minimalist, corporate, plain, paper, digital"
        },
        'watercolor': {
            desc: "Watercolor painting, soft pastel colors, paper texture bleed, wet-on-wet technique, artistic splashes, dreamy atmosphere, delicate brushstrokes, traditional illustration",
            neg: "solid colors, vector, hard lines, digital, 3d, neon, dark, heavy"
        },
        'low-poly': {
            desc: "Low poly 3D art, flat shading, geometric shapes, origami style, minimal polygons, sharp facets, abstract and clean, vibrant colors, papercraft aesthetic",
            neg: "high poly, smooth, realistic, detailed textures, grain, noise"
        },
        'sticker': {
            desc: "Die-cut sticker style, thick white border, vector illustration, flat colors, clean simple shading, pop art style, isolated on plain background",
            neg: "bg, noise, photo, realistic, 3d, complex, messy, sketch"
        },
        'flat-vector': {
            desc: "Flat vector illustration, clean lines, minimalism, geometric shapes, vibrant limited color palette, corporate memphis style, no shading, modern graphic design",
            neg: "texture, grunge, 3d, realistic, sketch, gradient, noise, blur"
        },
        'psychedelic': {
            desc: "Psychedelic art style, trippy visual effects, fractals, swirling patterns, vibrant neon colors, surrealism, hallucinogenic atmosphere, detailed and intricate",
            neg: "bland, minimalist, black and white, realistic, simple, clean, structured"
        },
        'ukiyo-e': {
            desc: "Ukiyo-e woodblock print style, japanese traditional art, bold outlines, flat colors, textured paper background, wave patterns, ink wash, hokusai inspired",
            neg: "3d, realistic, digital, modern, neon, glossy, photography"
        },
        'gothic': {
            desc: "Gothic dark fantasy style, melancholic atmosphere, intricate gothic architecture details, dark color palette, crimson and black, ethereal lighting, mysterious and haunting",
            neg: "bright, happy, colorful, cute, simple, minimal, cartoon"
        },
        'pop-art': {
            desc: "Pop art style, andy warhol inspired, ben-day dots, bold contrasting colors, comic book aesthetic, mass production vibe, retro 60s feel, silkscreen texture",
            neg: "realistic, 3d, painterly, soft, muted, dark, sketch"
        },
        'chibi': {
            desc: "Chibi kawaii style, large head small body, big expressive eyes, cute proportions, soft coloring, blush stickers, anime aesthetic, mascot character design",
            neg: "realistic, scary, gritty, detailed anatomy, tall, serious"
        },
        'sketch': {
            desc: "Rough pencil sketch, graphite texture, cross-hatching shading, white paper background, artistic, loose lines, hand-drawn aesthetic, charcoal details",
            neg: "color, paint, 3d, digital, clean lines, vector, photo"
        },
        'noir': {
            desc: "Film noir style, high contrast black and white, dramatic shadows, mysterious atmosphere, silhouette, cinematic composition, vintage photography feel, grain",
            neg: "color, vibrant, bright, anime, cartoon, 3d, painting"
        }
    };

    const artThemes = {
        'none': { desc: "" },
        'doodle': { desc: "Doodle art style, whimsical sketches, playful lines, simple hand-drawn feel" },
        'zentangle': { desc: "Zentangle pattern, intricate repetitive patterns, structured doodles, meditative art, black and white ink style" },
        'mandala': { desc: "Mandala design, circular symmetric patterns, spiritual geometry, detailed radial balance, kaleidoscopic" },
        'scribble': { desc: "Scribble art, messy looping lines, ink chaos, expressive strokes, frenetic energy" },
        'line-drawing': { desc: "Continuous line drawing, minimalist single line, contour sketch, abstract simplicity" }
    };

    // --- Elements ---
    const characterInput = document.getElementById('character');
    const artStyleSelect = document.getElementById('artStyle');
    const moodSelect = document.getElementById('mood');
    const artThemeSelect = document.getElementById('artTheme');
    const positioningSelect = document.getElementById('positioning');
    const aspectRatioSelect = document.getElementById('aspectRatio');
    const generateBtn = document.getElementById('generateBtn');
    const jsonOutput = document.getElementById('jsonOutput');
    const copyBtn = document.getElementById('copyBtn');

    // --- Functions ---

    function generatePrompt() {
        const charName = characterInput.value.trim() || "Character";
        const styleKey = artStyleSelect.value;
        const styleData = artStyles[styleKey];
        const artThemeKey = artThemeSelect.value;
        const artThemeData = artThemes[artThemeKey];
        const mood = moodSelect.value;
        const positioning = positioningSelect.value;
        const aspectRatio = aspectRatioSelect.value;

        // --- Positive Prompt Construction ---

        let styleIntro = "";
        let styleDetails = styleData.desc;
        const globalSuffix = "Clean plain background. Centered composition, crisp focus, cinematic lighting , 8K NFT artwork,";

        // Customize intro based on style slightly for better flow
        if (styleKey === 'none') {
            styleIntro = "Portrait of a";
        } else if (styleKey === '90s-anime') {
            styleIntro = "High-quality anime portrait of a humanoid";
        } else if (styleKey.startsWith('pixel-')) {
            styleIntro = "Pixel art portrait of a";
        } else if (styleKey === 'oil-painting' || styleKey === 'watercolor' || styleKey === 'ukiyo-e') {
            styleIntro = "Painting of a";
        } else if (styleKey === 'kids-drawing') {
            styleIntro = "Child's crayon drawing of a";
        } else if (styleKey === 'sticker' || styleKey === 'flat-vector' || styleKey === 'chibi') {
            styleIntro = "Vector illustration of a";
        } else {
            styleIntro = `Portrait of a`;
        }

        // Combine inputs: Intro + Character + Mood + Details + Global Suffix
        // If mood is 'normal', maybe we don't need to specify it explicitly, or we keep it simple.
        let moodString = (mood === 'normal') ? "" : `, ${mood} expression`;

        // Art Theme Description
        let themeDesc = "";
        if (artThemeKey !== 'none' && artThemeData.desc) {
            themeDesc = ", " + artThemeData.desc;
        }

        const fullPrompt = `${styleIntro} ${charName}${moodString}. ${styleDetails}${themeDesc} ${globalSuffix}`.replace(/  +/g, ' ');

        // --- Negative Prompt Construction ---

        // Base requested negative prompt
        let baseNeg = "clothes, accessories, text, watermark, cartoonish, low-res, 3D render, deformed anatomy";

        // Check if style is 3D to remove "3D render" from negative prompt
        const is3D = ['3d-render', 'low-poly'].includes(styleKey);

        if (is3D) {
            baseNeg = baseNeg.replace("3D render,", "").replace(", 3D render", "").replace("3D render", "");
        }

        // Combine with style specific
        // If style is none, styleData.neg is empty so it just adds trailing comma/space effectively, need to clean up
        let combinedNeg = `${baseNeg}, ${styleData.neg}`;
        if (combinedNeg.endsWith(", ")) combinedNeg = combinedNeg.slice(0, -2);


        // Create the JSON object (matching the user's requested format)
        const outputData = {
            "character": charName,
            "prompt": fullPrompt.trim(),
            "negative_prompt": combinedNeg,
            "aspect_ratio": aspectRatio,
            "positioning": positioning,
            "art_theme": artThemeKey,
            "mood": mood
        };

        // Display JSON
        jsonOutput.textContent = JSON.stringify(outputData, null, 4);

        // Add a subtle flash effect to the output box
        const wrapper = document.querySelector('.code-block-wrapper');
        wrapper.style.borderColor = '#00ff41';
        setTimeout(() => {
            wrapper.style.borderColor = ''; // Revert to CSS default
        }, 300);
    }

    function copyToClipboard() {
        const text = jsonOutput.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            copyBtn.style.color = '#00ff41';
            copyBtn.style.borderColor = '#00ff41';

            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.color = '';
                copyBtn.style.borderColor = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    // --- Event Listeners ---
    generateBtn.addEventListener('click', generatePrompt);

    // Allow "Enter" key in character input to trigger generation
    characterInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generatePrompt();
        }
    });

    copyBtn.addEventListener('click', copyToClipboard);

    // Initial Trigger (Optional, to show something on load)
    // generatePrompt(); 
});
