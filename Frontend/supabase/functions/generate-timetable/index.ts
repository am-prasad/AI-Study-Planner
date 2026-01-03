import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { syllabusText, subjectName, availableHoursPerWeek, totalHours, difficulty } = await req.json();
    
    console.log('Generating timetable for:', subjectName);
    console.log('Available hours per week:', availableHoursPerWeek);
    console.log('Total hours needed:', totalHours);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an intelligent study planner AI. Your task is to analyze a syllabus and create an optimal study timetable.

Given the syllabus content, available study hours, and difficulty level, create a structured study plan with:
1. Break down the syllabus into chapters/topics
2. Estimate time needed for each topic based on difficulty
3. Create a weekly schedule that fits within available hours
4. Include revision slots and breaks

Respond ONLY with valid JSON in this exact format:
{
  "chapters": [
    {
      "id": "ch1",
      "name": "Chapter Name",
      "estimatedHours": 5,
      "topics": ["Topic 1", "Topic 2"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "weeklySchedule": [
    {
      "week": 1,
      "sessions": [
        {
          "day": "Monday",
          "duration": 2,
          "topic": "Chapter 1 - Introduction",
          "type": "study" | "revision" | "practice"
        }
      ]
    }
  ],
  "totalWeeks": 8,
  "recommendations": ["Tip 1", "Tip 2"]
}`;

    const userPrompt = `Create a study timetable for the subject "${subjectName}".

Syllabus Content:
${syllabusText || "No syllabus provided - create a general structure based on typical curriculum for this subject."}

Parameters:
- Available hours per week: ${availableHoursPerWeek} hours
- Total estimated study hours needed: ${totalHours} hours
- Difficulty level: ${difficulty}/5

Please analyze and create an optimal study plan.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate timetable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI Response received');

    // Parse the JSON response
    let timetableData;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      timetableData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a basic structure if parsing fails
      timetableData = {
        chapters: [
          { id: "ch1", name: "Introduction", estimatedHours: Math.ceil(totalHours * 0.2), topics: ["Basics"], priority: "high" },
          { id: "ch2", name: "Core Concepts", estimatedHours: Math.ceil(totalHours * 0.5), topics: ["Main content"], priority: "high" },
          { id: "ch3", name: "Advanced Topics", estimatedHours: Math.ceil(totalHours * 0.2), topics: ["Advanced"], priority: "medium" },
          { id: "ch4", name: "Revision", estimatedHours: Math.ceil(totalHours * 0.1), topics: ["Review"], priority: "low" },
        ],
        totalWeeks: Math.ceil(totalHours / availableHoursPerWeek),
        recommendations: ["Start with fundamentals", "Practice regularly", "Take breaks"],
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      timetable: timetableData 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating timetable:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
