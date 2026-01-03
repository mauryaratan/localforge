# add-tool

This project adds utilties for developers, and adds specific tools to the app.

When asked to add a tool:

- Ultrathink and prepare a list of feature needed surrounding that tool.
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
