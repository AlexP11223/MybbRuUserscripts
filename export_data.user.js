// ==UserScript==
// @name         Export data from a mybb.ru forum
// @namespace    programmers.forumsvn.com
// @version      1.1.0
// @description  adds exportThreads function to export the specified threads
// @author       Alex P
// @include      *programmers.forumsvn.com/*
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.2.2/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.2/dist/FileSaver.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @grant        none
// @downloadURL  https://github.com/AlexP11223/MybbRuUserscripts/raw/master/export_data.user.js
// ==/UserScript==

(function () {
    'use strict';

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseHtml(html) {
        return new DOMParser().parseFromString(html, 'text/html')
    }

    function parseThread(html) {
        const htmlDoc = parseHtml(html);

        const lastPageLink = htmlDoc.querySelector('.pagelink a:not(.next):nth-last-child(2)');

        const categoryLink = htmlDoc.querySelector('.crumbs').querySelector('a:last-of-type');

        const posts = htmlDoc.querySelectorAll('.post');

        return {
            title: htmlDoc.title,
            category: {
                id: new URL(categoryLink.href).searchParams.get('id'),
                name: categoryLink.textContent.trim(),
            },
            pageCount: lastPageLink ? parseInt(lastPageLink.textContent.trim()) : 1,
            posts: Array.from(posts).map(el => {
                const emailLink = el.querySelector('.pl-email a[href^="mailto:"]');
                return {
                    id: el.id.replace('p', ''),
                    author: {
                        id: new URL(el.querySelector('.pl-email a[href*="profile.php"]').href).searchParams.get('id'),
                        name: el.querySelector('.pa-author a').textContent,
                        email: emailLink ? emailLink.href.substring(7) : null,
                    },
                };
            }),
        };
    }

    function threadUrl(threadId) {
        return `/viewtopic.php?id=${threadId}`;
    }

    function generateThreadPagesUrls(threadId, pageCount) {
        const firstPageUrl = threadUrl(threadId);
        return [firstPageUrl, ..._.range(2, pageCount + 1, 1).map(n => `${firstPageUrl}&p=${n}`)];
    }

    async function loadPostSource(postId) {
        // requires admin/moderator rights (except your own posts)
        const url = `/edit.php?id=${postId}`;
        console.log(`Loading ${url}`);
        const html = await $.get(url);
        const htmlDoc = parseHtml(html);

        const textarea = htmlDoc.querySelector('#main-reply');

        return textarea.value;
    }

    async function loadThread(id) {
        await sleep(_.random(500, 3000));

        console.log(`Loading ${threadUrl(id)}`);
        const firstPage = parseThread(await $.get(threadUrl(id)));

        console.log(`${firstPage.title} (${firstPage.pageCount} pages)`);

        let pages = [firstPage];
        for (const url of generateThreadPagesUrls(id, firstPage.pageCount).slice(1)) {
            await sleep(_.random(500, 3000));

            console.log(`Loading ${url}`);
            pages.push(parseThread(await $.get(url)));
        }

        const posts = _.flatten(pages.map(p => p.posts));

        console.log(`${posts.length} posts`);

        let fullPosts = [];
        for (const post of posts) {
            await sleep(_.random(500, 3000));

            const postSource = await loadPostSource(post.id);

            fullPosts.push({
                ...post,
                source: postSource,
            });
        }

        return {
            id,
            title: firstPage.title,
            category: firstPage.category,
            pageCount: firstPage.pageCount,
            posts: fullPosts
        };
    }

    window.exportThreads = async function (...ids) {
        let threads = [];
        for (const id of ids) {
            try {
                threads.push(await loadThread(id));
            } catch (e) {
                console.error(`Failed to load thread ${id}`);
                console.error(e);
            }
        }

        const zip = new JSZip();

        const ZIP_ROOT = 'mybbru_export/';
        const dtStr = moment().format('YYYY-MM-DD_HH-mm-ss');

        zip.file(`${ZIP_ROOT}threads_${dtStr}.json`, JSON.stringify(threads, null, '  '));

        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 6
            }
        });
        saveAs(zipBlob, `threads_${dtStr}.zip`);
    };
})();
