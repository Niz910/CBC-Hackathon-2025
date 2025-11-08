import os
from anthropic import Anthropic
from dotenv import load_dotenv
import re
import json

load_dotenv()

template = "You are tasked with extracting biological terminology from a conference transcript. Your goal is to identify and catalog scientific terms specifically related to biology, genetics, molecular biology, and related fields.\n\nHere is the conference transcript to analyze:\n\n<transcript>\n{{TRANSCRIPT}}\n</transcript>\n\n## What Qualifies as a Biological Term\n\nInclude terms that fall into these categories:\n- Gene names (e.g., p53, BRCA1, myc)\n- Protein names (e.g., hemoglobin, insulin, collagen)\n- Biological processes (e.g., transcription, translation, mitosis)\n- Cellular components (e.g., mitochondria, ribosome, nucleus)\n- Organisms and species names (e.g., E. coli, Drosophila, Homo sapiens)\n- Biological molecules (e.g., DNA, RNA, ATP)\n- Medical/biological conditions (e.g., diabetes, cancer, mutation)\n- Biological techniques and methods (e.g., PCR, CRISPR, sequencing)\n- Anatomical terms (e.g., liver, neuron, tissue)\n\n## What to Exclude\n\nDo not include:\n- General scientific terms that aren't specifically biological (like \"data\", \"analysis\", \"significant\")\n- Common words that aren't technical terminology\n- General laboratory equipment or basic scientific concepts\n\n## Extraction Requirements\n\n1. **Preserve exact formatting**: Capture each term exactly as it appears in the transcript - maintain original spelling, capitalization, and formatting\n2. **Include variants**: If both abbreviated forms (like \"PCR\") and full forms (like \"polymerase chain reaction\") appear, include both\n3. **Include all nomenclature**: Capture species names in both common and scientific formats\n4. **No duplicates**: List each unique term only once, even if it appears multiple times\n5. **Focus on technical terms**: Prioritize specialized biological terminology over general words\n\n## Analysis Process\n\nBefore providing your final answer, work through the transcript systematically in <term_extraction> tags inside your thinking block:\n\n1. Scan through the entire transcript and quote all potential biological terms exactly as they appear in the text. It's OK for this section to be quite long.\n2. For each quoted term, evaluate whether it qualifies based on the criteria above, noting your reasoning for including or excluding each term\n3. Create a running list of accepted terms, preserving their exact formatting and capitalization\n4. Check for and eliminate any duplicates from your accepted terms list\n5. Verify that your final list is sorted alphabetically while maintaining exact formatting\n\n## Output Format\n\nProvide your final answer as a JSON object with this exact structure:\n\n```json\n{\n  \"biological_terms\": [\n    \"first_term_exactly_as_appears\",\n    \"second_term_exactly_as_appears\",\n    \"third_term_exactly_as_appears\"\n  ],\n  \"total_count\": number_of_unique_terms\n}\n```\n\nThe biological_terms array should:\n- Be sorted alphabetically\n- Preserve exact capitalization, spelling, and formatting from the original transcript\n- Contain only unique terms\n\nYour final output should contain only the JSON object and should not duplicate or rehash any of the extraction work you did in the thinking block."

def main(transcript):
    client = Anthropic(
        api_key=os.environ.get("ANTHROPIC_API_KEY"),  # This is the default and can be omitted
    )

    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=20000,
        temperature=1,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": template.replace('{{TRANSCRIPT}}', TRANSCRIPT)
                    }
                ]
            }
        ]
    )

    match = re.search(r"```json\s*([\s\S]+?)\s*```", message.content[0].text)

    if match:
        json_string = match.group(1)
        
        try:
            data = json.loads(json_string)
            return data
            
        except json.JSONDecodeError as e:
            print(f"Error in decoding JSON: {e}")
    else:
        print("No JSON found")

if __name__ == "__main__":
    file = 'transcript.txt'
    TRANSCRIPT = open(f'../audio-to-transcript/transcript/{file}', 'r').read()
    # TRANSCRIPT = 'Generates synthetic spatial data to augment sparse Xenium and MERFISH data to iteratively improve feature learning'

    d = main(TRANSCRIPT)
    print(d)
