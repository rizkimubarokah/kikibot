import React, { useState } from 'react';
import { Play, RotateCcw, Check, Copy } from 'lucide-react';

interface CodePreviewProps {
    code: string;
    language: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language }) => {
    const [output, setOutput] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleRun = () => {
        let htmlContent = '';

        if (language === 'html' || language === 'html5') {
            htmlContent = code;
        } else if (language === 'javascript' || language === 'js') {
            htmlContent = `
        <html>
          <body>
            <script>
              try {
                const log = console.log;
                console.log = (...args) => {
                  document.body.innerHTML += '<div style="font-family: monospace; color: #fff;">> ' + args.join(' ') + '</div>';
                  log(...args);
                };
                ${code}
              } catch (e) {
                document.body.innerHTML += '<div style="font-family: monospace; color: #ef4444;">Error: ' + e.message + '</div>';
              }
            </script>
          </body>
        </html>
      `;
        } else if (language === 'css') {
            htmlContent = `
        <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="demo">This is a demo for the CSS.</div>
            <div id="root">
                <h1>Hello World</h1>
                <p>Sample paragraph to demonstrate styling.</p>
                <button>Click Me</button>
            </div>
          </body>
        </html>
      `;
        } else {
            // Fallback for non-executable languages
            htmlContent = `<html><body><pre style="color:white">Cannot run ${language} code directly.</pre></body></html>`;
        }

        setOutput(htmlContent);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const canRun = ['html', 'javascript', 'js', 'css'].includes(language.toLowerCase());

    return (
        <div className="my-4 rounded-lg overflow-hidden border border-white/10 bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
                <span className="text-xs font-mono text-gray-400 lowercase">{language}</span>
                <div className="flex gap-2">
                    {canRun && (
                        <button
                            onClick={handleRun}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 hover:bg-white/5 rounded transition-colors"
                        >
                            <Play className="w-3 h-3" />
                            Run
                        </button>
                    )}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 hover:bg-white/5 rounded transition-colors"
                    >
                        {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                    <code>{code}</code>
                </pre>
            </div>

            {output && (
                <div className="border-t border-white/10 bg-dark-lighter">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526]">
                        <span className="text-xs font-medium text-gray-400">Output</span>
                        <button
                            onClick={() => setOutput(null)}
                            className="p-1 hover:text-white text-gray-500 transition-colors"
                            title="Close Output"
                        >
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                    <iframe
                        srcDoc={output}
                        className="w-full h-64 bg-white/5"
                        sandbox="allow-scripts"
                        title="Code Output"
                    />
                </div>
            )}
        </div>
    );
};

export default CodePreview;
