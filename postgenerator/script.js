document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const projectSelect = document.getElementById('project-select');
    const projectInfo = document.getElementById('project-info');
    const projectCategorySpan = document.getElementById('project-category');
    const variantSelect = document.getElementById('variant-select');
    const generateBtn = document.getElementById('generate-btn');
    const outputText = document.getElementById('output-text');
    const outputImagePrompt = document.getElementById('output-image-prompt');
    const socialCheckboxes = document.querySelectorAll('input[name="social"]');

    // Image Upload Elements
    const imageDropZone = document.getElementById('image-drop-zone');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');

    // Configuration
    const API_KEY = "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";
    const MODEL_ID = "openai/gpt-5.2";

    let projectsData = [];
    let uploadedImageFile = null;

    // Load Projects Data
    if (typeof PROJECTS_DATA !== 'undefined') {
        projectsData = PROJECTS_DATA;
        populateProjectSelect();
    } else {
        console.error('Projects data not found');
        projectSelect.innerHTML = '<option value="">Error loading projects</option>';
    }

    function populateProjectSelect() {
        projectSelect.innerHTML = '<option value="">-- Select Project --</option>';
        projectsData.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
        // Add Custom Option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '+ Custom Project';
        projectSelect.appendChild(customOption);
    }

    // Handle Project Selection
    projectSelect.addEventListener('change', () => {
        const projectId = projectSelect.value;
        const customInputContainer = document.getElementById('custom-project-container');

        // Reset states
        variantSelect.innerHTML = '<option value="">-- Select Variant --</option>';
        variantSelect.disabled = true;
        projectInfo.classList.add('d-none');
        customInputContainer.classList.add('d-none');

        if (projectId === 'custom') {
            // Handle Custom
            customInputContainer.classList.remove('d-none');
            variantSelect.disabled = false;

            // Add default variants
            ['Funny', 'Utility', 'Both'].forEach(v => {
                const option = document.createElement('option');
                option.value = v;
                option.textContent = v;
                variantSelect.appendChild(option);
            });

        } else {
            // Handle Existing Project
            const project = projectsData.find(p => p.id === projectId);
            if (project) {
                projectCategorySpan.textContent = project.category;
                projectInfo.classList.remove('d-none');

                project.variants.forEach(variant => {
                    const option = document.createElement('option');
                    option.value = variant;
                    option.textContent = variant;
                    variantSelect.appendChild(option);
                });
                variantSelect.disabled = false;
            }
        }
    });

    // Image Upload Logic
    imageDropZone.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageFile(e.target.files[0]);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, () => imageDropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        imageDropZone.addEventListener(eventName, () => imageDropZone.classList.remove('drag-over'), false);
    });

    imageDropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    function handleImageFile(file) {
        uploadedImageFile = file;

        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `
                <div class="preview-box">
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-img-btn" onclick="removeImage(event)">×</button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }

    window.removeImage = (e) => {
        e.stopPropagation();
        uploadedImageFile = null;
        imagePreview.innerHTML = '';
        imageInput.value = '';
    }

    // Generate Logic
    generateBtn.addEventListener('click', () => {
        // Validation
        const selectedSocials = Array.from(socialCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const projectId = projectSelect.value;
        const variant = variantSelect.value;

        let project = null;

        if (selectedSocials.length === 0) {
            alert('Please select at least one Social Platform.');
            return;
        }
        if (!projectId) {
            alert('Please select a Project.');
            return;
        }

        if (projectId === 'custom') {
            const customName = document.getElementById('custom-project-name').value.trim();
            if (!customName) {
                alert('Please enter a Custom Project Name.');
                return;
            }
            project = {
                name: customName,
                category: "Custom Project"
            };
        } else {
            project = projectsData.find(p => p.id === projectId);
        }

        if (!variant) {
            alert('Please select a Variant.');
            return;
        }

        generateAIContent(project, variant, selectedSocials);
    });

    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    async function generateAIContent(project, variant, socials) {
        // UI Loading State
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating... (AI)';
        outputText.textContent = 'Generating text...';
        outputImagePrompt.textContent = 'Generating prompt...';

        try {
            let imageBase64 = null;
            if (uploadedImageFile) {
                imageBase64 = await fileToBase64(uploadedImageFile);
            }

            // 1. Generate Text Post
            let textSystemPrompt = `Generate an ULTIMATE SHILLING and BAITING social media post for the crypto project "${project.name}" (${project.category}).
            Target Platforms: ${socials.join(', ')}.
            Style: Casual, native crypto-twitter speaker, meme-centric. Use broken grammar or lowercase sometimes for authenticity. Avoid sounding like a corporate ad or a bot.
            Tone: Hype but grounded in community slang. Use phrases like "bro literally", "ngmi", "imagine fading", "send it".
            Constraints: Do NOT use "giveaway", "Alpha leak", "100x incoming" (too bot-like). Do NOT ask explicitly to "Retweet", "Like", "Follow". Do NOT start every post with "POV" or "Diamond hands". vary the sentence structure.
            Requirements: Use emojis sparsely but effectively (�, �, 🤡, �), keep it under 280 characters.
            Output ONLY the post text.`;

            if (imageBase64) {
                textSystemPrompt += `\nCONTEXT: The user has provided an image to go along with this post. ensure the text post is relatable to this image (e.g., mentions what's happening or the vibe), but keep the main focus on the project "${project.name}" and the "${variant}" angle.`;
            }

            const textResponse = await callOpenRouter(textSystemPrompt, imageBase64);
            outputText.textContent = textResponse;

            // 2. Generate Image Prompt
            let imageGenPrompt = `Generate a detailed text-to-image prompt for an AI art generator (like Midjourney or Stable Diffusion).
            
            SOURCE TEXT POST: "${textResponse}"
            
            TASK: Create a visual depiction of the SCENARIO or ACTION described in the Source Text Post above.
            - Interpret crypto slang creatively into visual metaphors.
            - Examples of funny crypto references to use if applicable:
              * "Green dildos" -> Giant green candles on a chart.
              * "McDonald's hat" -> Working at fast food after losing money.
              * "Bogdanoff/Whales" -> Figures manipulating the market.
              * "Wojak/Pepe" -> Emotional reactions (crying behind mask, smug face).
              * "Rug pull" -> Literally pulling a rug or floor disappearing.
              * "Diamond hands" -> Hands made of diamond holding coins.
              * "Paper hands" -> Hands dissolving or dropping coins.
              * "Chad" -> Muscular cool character.
              * "Aping in" -> Apes pressing 'buy' buttons furiously.
              * "Jeets" -> Nervous looking characters selling for pennies.
            - MATCH the specific vibe of the text post (e.g., if it's about holding, show diamond hands; if it's about a pump, show vertical green lines).
            
            Project: ${project.name} (${project.category})
            Style: High quality, trending on artstation, ${variant === 'Funny' ? 'funny, caricature, meme style' : 'cinematic, futuristic, 8k'}.
            Output ONLY the prompt string.`;

            if (imageBase64) {
                imageGenPrompt += `\nCONTEXT: The user provided a reference image. Use the CHARACTER or SUBJECT from this reference image, but place them into the scene/action described in the Source Text Post. The character appearance should match the reference, but the pose and background should match the text post's narrative.`;
            }

            const imageResponse = await callOpenRouter(imageGenPrompt, imageBase64);
            outputImagePrompt.textContent = imageResponse;

        } catch (error) {
            console.error('AI Generation Error:', error);
            outputText.textContent = 'Error generating content. Please check console.';
            outputImagePrompt.textContent = 'Error generating content.';
            alert('Failed to generate content via AI.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Posts';
        }
    }

    async function callOpenRouter(promptText, imageBase64 = null) {
        try {
            const content = [];

            // Add Text
            content.push({
                type: "text",
                text: promptText
            });

            // Add Image if present
            if (imageBase64) {
                content.push({
                    type: "image_url",
                    image_url: { url: imageBase64 }
                });
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:8080",
                    "X-Title": "NFT Tools Post Generator"
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        {
                            role: "user",
                            content: content
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API Request Failed');
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "No content generated.";

        } catch (error) {
            throw error;
        }
    }
});

// Global Helper
function copyToClipboard(elementId, btn) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}
