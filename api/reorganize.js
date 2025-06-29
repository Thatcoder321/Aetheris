

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Get the data package from the front-end
        const { currentLayout, viewport, userPrompt } = req.body;


        if (!currentLayout || !viewport || !userPrompt) {
            return res.status(400).json({ error: 'Missing required layout data.' });
        }


// In api/reorganize.js

const systemPrompt = `You are an expert UI/UX layout designer for a dashboard called Aetheris. Your task is to reorganize a user's widgets based on their request.
- The dashboard is a grid that is 12 columns wide.
- The user's screen size is ${viewport.width}px wide by ${viewport.height}px tall.
- You must only change the x, y, w (width), and h (height) properties for the widgets provided. Do NOT add or remove any widgets.
- Do NOT allow widgets to overlap. The sum of a widget's x and w cannot exceed 12.

--- WIDGET GUIDE ---
This guide describes the nature of each widget. Use this information to make intelligent layout decisions.
- 'greeting': A wide, short banner widget. Best placed at the top (y: 0) with a large width (e.g., w: 12).
- 'clock': A small, compact, squarish widget. Flexible position. (e.g., w: 4, h: 2).
- 'weather': A small, compact, squarish widget, similar to the clock. (e.g., w: 4, h: 2).
- 'todo': A TALL, vertical widget. It needs more height (h) than width (w) to display a list of tasks. (e.g., w: 4, h: 5).
- 'ai-chat': A LARGE, primary widget. It needs significant width and height to be usable for conversations. This is often the main widget. (e.g., w: 7, h: 5).
--- END GUIDE ---

- Prioritize the user's request, but also apply good design principles based on the Widget Guide. For example, do not give the 'todo' widget a small height.
- Your response MUST be ONLY a single, valid JSON object in the format: { "layout": [...] }. The value for the "layout" key must be the JSON array of the new widget positions. Do not include any other text, explanations, or markdown.`;

        const userQuery = `Current layout: ${JSON.stringify(currentLayout)}\nUser request: "${userPrompt}"`;

        // 4. Call the OpenAI API using the direct fetch method
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` // Securely gets key from Vercel
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery }
                ],
                
                response_format: { type: "json_object" } 
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }


        const responseContent = data.choices[0].message.content;
        const responseObject = JSON.parse(responseContent);
        

        const newLayoutArray = responseObject.layout;
        
        if (!Array.isArray(newLayoutArray)) {
            throw new Error('AI did not return a valid layout array.');
        }
        

        res.status(200).json({ layout: newLayoutArray });
res.status(200).json({ newLayout: finalLayout });

    } catch (err) {
        console.error("Reorganization Error:", err);
        res.status(500).json({ error: "Failed to generate new layout." });
    }
}