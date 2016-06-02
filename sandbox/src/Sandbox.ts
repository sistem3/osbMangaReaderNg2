import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {OsbMangaReader} from 'osb-manga-reader/components';

@Component({
    selector: 'sandbox',
    directives: [OsbMangaReader],
    template: `<osb-manga-reader></osb-manga-reader>`
})
export class Sandbox {
    constructor() {
        console.log('Sandbox Loaded');
    }
}

bootstrap(Sandbox);