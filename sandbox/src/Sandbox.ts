import {Component} from '@angular/core';
import {enableProdMode} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {OsbMangaReader} from 'osb-manga-reader/components';
import { Http, HTTP_PROVIDERS, Headers, RequestOptions } from '@angular/http';
import 'Swiper';
declare let Swiper;

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
//enableProdMode();
bootstrap(Sandbox, HTTP_PROVIDERS);