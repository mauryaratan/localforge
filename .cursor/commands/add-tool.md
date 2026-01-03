# add-tool

This project adds utilties for developers, and adds specific tools to the app.

As a senior software engineer, when asked to add a tool:

- Ultrathink and prepare a list of feature needed surrounding that tool.
- Use firecrawl MCP to find similar tool online and the features they offer, and extract the handy features without bloating the tool
- Keep in mind this is a PWA, and performance is our topmost priority.
- Add a new Next.js route for /tool-name
- Add the tool to the main sidebar
- For example: When a tool is added for "URL Parser", the tool should parse the URL properly and break it into key value for URL properties.
- Write tests file in a central location using Vitest (already installed)
- Make sure each tool has proper SEO markups
- Use localStorage to save main input value so switching routes keeps the existing values
- Ensure actionable buttons have `cursor-pointer` class added
- Extract any reusable components into `/lib` directory and re-use
- Utilize page space well, keep important sections first. Any example inputs should probably be in another section/sidebar on the right and adapt well on smaller devices.
- If adding a secondary section on right for example or anything else, make sure its sticky and the main section width remain consistent across all tools.
- Use Shadcn MCP to find and install appropriate components that may make the experience better for end users
- Feel free to use animations and transitions for subtle effects but don't overdo it.
