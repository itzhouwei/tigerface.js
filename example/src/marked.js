const hljs = require('highlight.js');

const { $ } = global;
// Create reference instance
const myMarked = require('marked');

// Get reference
const renderer = new myMarked.Renderer();

renderer.link = function (href, title, text) {
    const prefix = 'tigerface-embed:';
    if (title && title.startsWith(prefix)) {
        const name = title.substr(prefix.length);
        return `<div>${text}</div><div id="${name}"></div><script src="${href.replace(/html/g, 'js')}"></script>`;
    }
    return `<a href="${href}" title="${title}">${text}</a>`;
};

myMarked.setOptions({
    highlight(code, lang) {
        const hljsCode = (hljs.highlight(lang, code, false)).value;
        return `<div class="hljs">${hljsCode}</div>`;
    },
});

$(() => {
    $.get('hello.md', (md) => {
        const result = myMarked(md, { renderer });
        $('#root').html(result);
    });
});
