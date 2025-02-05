/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration[] = [
  {
    name: "render_altair",
    description: "Displays an altair graph in json format.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        json_graph: {
          type: SchemaType.STRING,
          description:
            "JSON STRING representation of the graph to render. Must be a string, not a json object",
        },
      },
      required: ["json_graph"],
    },
  },
  {
    name: "render_solution",
    description: "Displays a solution with formatted text.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        solution_text: {
          type: SchemaType.STRING,
          description: "The formatted solution text to display. Use markdown formatting for better presentation.",
        },
      },
      required: ["solution_text"],
    },
  }
];

function AltairComponent() {
  const [solutionText, setSolutionText] = useState<string>("");
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are my helpful assistant. For graphs, use the "render_altair" function. For any text responses including explanations, stories, code, or other content, use the "render_solution" function to display formatted text. Always provide clear, well-formatted responses. Your voice will narrate the solution while the text is displayed. 

When writing code, wrap it in markdown code blocks with the appropriate language specified. For example:
\`\`\`python
print("Hello World")
\`\`\`

Use markdown formatting to improve readability:
- Use # for headers
- Use ** for bold text
- Use * for italic text
- Use - or * for bullet points
- Use > for blockquotes
- Use horizontal rules (---) to separate sections`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: declaration },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      toolCall.functionCalls.forEach((fc) => {
        if (fc.name === "render_altair") {
          setJSONString((fc.args as { json_graph: string }).json_graph);
        } else if (fc.name === "render_solution") {
          setSolutionText((fc.args as { solution_text: string }).solution_text);
        }
      });
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);

  return (
    <div className="solution-container">
      {solutionText && (
        <div className="solution-text">
          {solutionText.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      <div className="vega-embed" ref={embedRef} />
    </div>
  );
}

export const Altair = memo(AltairComponent);
