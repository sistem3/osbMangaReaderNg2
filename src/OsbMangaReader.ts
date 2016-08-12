import {Component} from '@angular/core';
import { Http, HTTP_PROVIDERS, Headers, RequestOptions } from '@angular/http';
import 'Swiper';
declare let Swiper;

@Component({
    selector: 'osb-manga-reader',
    templateUrl: 'node_modules/osb-manga-reader/lib/OsbMangaReader.html',
    styleUrls: ['node_modules/osb-manga-reader/lib/OsbMangaReader.css']
})
export class OsbMangaReader {
    isLoading = true;
    section = '';
    baseUrl = '';
    defaultSite = '';
    apiKey = '';
    listStyle = false;

    mangaDetails = [];
    mangaInfo = {};
    mangaChapter = {};

    siteFavouritesUrl = '';
    siteFavouritesData = [];
    siteFavouritesDisplay = [];

    mainListViewData = [];
    mainListViewDisplay = [];
    mainListViewDisplayCount = 0;

    sliderSettings = {};
    viewerSettings = {
        whichManga: {},
        chapter: 1,
        chaptersTotal: 0,
        chapterPagesTotal: 0,
        isPage: 1,
        hasBookmarks: false
    };
    userSettings = {};

    constructor(public http: Http) {
        // Initial Settings
        this.isLoading = true;
        this.listStyle = false;
        this.section = 'site-favourites';
        // API Settings
        this.baseUrl = 'https://doodle-manga-scraper.p.mashape.com/';
        this.apiKey = 'xiQSdA9ACbmshUxnm4ZBC8nn2umSp1LeqQfjsnnVeMWHHSIQy0';
        this.defaultSite = 'mangareader.net';
        // App Favourites Settings
        this.siteFavouritesUrl = 'http://private-e00abd-osbmangareader.apiary-mock.com/topfeed';
        this.siteFavouritesData = [];
        this.siteFavouritesDisplay = [];

        this.mangaDetails = [];
        this.mangaInfo = {};
        this.mangaChapter = {};

        this.mainListViewData = [];
        this.mainListViewDisplay = [];
        this.mainListViewDisplayCount = 0;
        // Swiper Settings
        this.sliderSettings = {
            slidesPerView: 1,
            keyboardControl: true,
            preloadImages: false,
            lazyLoading: true,
            onInit: this.sliderOnInit.bind(this),
            onSlideChangeEnd: this.slideChanged.bind(this),
            onReachEnd: this.chapterFinish.bind(this)
        };
        // User Settings
        this.userSettings = {
            bookmarks: [],
            favourites: []
        };
        console.log(this);
        this.checkCache();
    }

    sliderOnInit(swiper) {
        this.viewerSettings.chapterPagesTotal = swiper.slides.length;
    }

    slideChanged(swiper) {
        this.viewerSettings.isPage = swiper.activeIndex + 1;
    }

    chapterFinish(swiper) {
        var nextChapter = this.viewerSettings.chapter + 1;
        this.getMangaChapter(this.viewerSettings.whichManga, nextChapter);
    }

    checkCache() {
        var mainListData = localStorage.getItem('osbMangaReader.mainList');
        if (mainListData) {
            this.mainListViewData = JSON.parse(mainListData);
        }

        var siteFavourites = localStorage.getItem('osbMangaReader.siteFavourites');
        if (siteFavourites) {
            this.siteFavouritesData = JSON.parse(siteFavourites);
        }

        var mangaDetails = localStorage.getItem('osbMangaReader.mangaDetails');
        if (mangaDetails) {
            this.mangaDetails = JSON.parse(mangaDetails);
        }
        this.getSiteFavourites();
    }

    initSlider() {
        var holder = this;
        setTimeout(function(){
            var viewportSize = window.innerHeight - 90;
            document.querySelector('.osb-manga-reader-holder .swiper-container').setAttribute('style','height:' + viewportSize + 'px;');
            var mangaView = new Swiper(document.querySelector('.osb-manga-reader-holder .swiper-container'), holder.sliderSettings);
        }, 500);
    }

    getMangaChapter(manga, chapter) {
        this.viewerSettings.isPage = 1;
        this.viewerSettings.chapter = chapter;
        this.viewerSettings.whichManga = manga;
        this.viewerSettings.chaptersTotal = manga.chapters.length;
        let headers = new Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite  + '/manga/' + manga.href + '/' + chapter, options)
            .subscribe(response => this.setMangaChapter(response));
    }

    setMangaChapter(chapter) {
        this.mangaChapter = chapter.json();
        this.section = 'manga-chapter';
        this.isLoading = false;
        this.initSlider();
    }

    getMainMangaList() {
        var holder = this;
        if (this.mainListViewData.length > 1) {
            var mainViewData = this.mainListViewData.slice(0, 20);
            mainViewData.forEach(function(element) {
                holder.getMangaDetails(element, 'main-view', false);
            });
            return false;
        }
        let headers = new Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite, options)
            .subscribe(response => this.setMainMangaList(response));
    }

    viewMangaDetails (manga) {
        this.mangaInfo = manga;
        this.section = 'manga-info';
    }

    setMainMangaList(data) {
        console.log(data.json());
        var holder = this;
        this.mainListViewData = data.json();
        localStorage.setItem('osbMangaReader.mainList', JSON.stringify(this.mainListViewData));

        var mainViewData = this.mainListViewData.slice(0, 20);
        mainViewData.forEach(function(element) {
            holder.getMangaDetails(element, 'main-view', false);
        });
    }

    getMangaDetails(manga, section, cache) {
        var holder = this;
        if (this.mangaDetails.length > 1 && cache) {
            this.mangaDetails.forEach(function(element) {
                if (manga.title === element.name) {
                    if (section === 'site-favourites' && holder.siteFavouritesDisplay.indexOf(element) == -1) {
                        holder.section = 'site-favourites';
                        holder.siteFavouritesDisplay.push(element);
                        holder.isLoading = false;
                    }
                }
            });
            return false;
        }

        let headers = new Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite + '/manga/' + manga.mangaId, options)
            .subscribe(response => this.setMangaDetails(response, section, cache));
    }

    setMangaDetails(manga, section, cache) {
        var data = manga.json();
        if (cache) {
            this.mangaDetails.push(data);
            localStorage.setItem('osbMangaReader.mangaDetails', JSON.stringify(this.mangaDetails));
        }

        if (section === 'main-view') {
            this.section = 'main-view';
            this.mainListViewDisplay.push(data);
            this.isLoading = false;
        }

        if (section === 'site-favourites') {
            this.section = 'site-favourites';
            this.siteFavouritesDisplay.push(data);
            this.isLoading = false;
        }
    }

    getSiteFavourites() {
        var holder = this;
        this.siteFavouritesDisplay = [];
        if (this.siteFavouritesData.length > 1) {
            this.siteFavouritesData.forEach(function(element) {
                holder.getMangaDetails(element, 'site-favourites', true);
            });

            return false;
        }
        this.http.get(this.siteFavouritesUrl)
            .subscribe(response => this.setSiteFavourites(response));
    };

    setSiteFavourites(data) {
        var holder = this;
        this.siteFavouritesData = data.json();
        localStorage.setItem('osbMangaReader.siteFavourites', JSON.stringify(this.siteFavouritesData));
        this.siteFavouritesData.forEach(function(element) {
            holder.getMangaDetails(element, 'site-favourites', true);
        });
    }

}