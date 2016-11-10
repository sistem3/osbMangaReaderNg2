"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const http_1 = require('@angular/http');
require('Swiper');
require('ScrollMagic');
require('Drift');
let mangaView, pageScene, pageController, driftInstance;
let OsbMangaReader = class OsbMangaReader {
    constructor(http) {
        this.http = http;
        this.section = '';
        this.baseUrl = '';
        this.defaultSite = '';
        this.apiKey = '';
        this.isLoading = true;
        this.listStyle = false;
        this.hideMenu = false;
        this.showMessage = false;
        this.messageType = '';
        this.mangaDetails = [];
        this.mangaInfo = {};
        this.mangaChapter = {};
        this.siteFavouritesUrl = '';
        this.siteFavouritesData = [];
        this.siteFavouritesDisplay = [];
        this.mainListViewData = [];
        this.mainListViewDisplay = [];
        this.mainListViewDisplayCount = 0;
        this.mainListViewDisplayPage = 1;
        this.mainListViewDisplayPageLength = 20;
        this.sliderSettings = {};
        this.viewerSettings = {
            whichManga: {},
            mangaTitle: '',
            chapter: 1,
            chapterPosition: 0,
            chaptersTotal: 0,
            chapterPagesTotal: 0,
            isPage: 1,
            isBookmark: false,
            hasBookmarks: false,
            hasNextBookmark: false,
            hasPrevBookmark: false,
            nextBookmark: {},
            prevBookmark: {},
            usingMagnifier: false,
            isReading: false,
            prevChapterShow: false,
            nextChapterShow: false,
            wasReading: {
                manga: {},
                chapter: 0,
                page: 0
            }
        };
        this.userSettings = {
            nightMode: false,
            bookmarks: [],
            favourites: []
        };
        this.section = 'site-favourites';
        this.baseUrl = 'https://doodle-manga-scraper.p.mashape.com/';
        this.apiKey = 'xiQSdA9ACbmshUxnm4ZBC8nn2umSp1LeqQfjsnnVeMWHHSIQy0';
        this.defaultSite = 'mangareader.net';
        this.siteFavouritesUrl = 'http://private-e00abd-osbmangareader.apiary-mock.com/topfeed';
        this.sliderSettings = {
            initialSlide: 0,
            slidesPerView: 1,
            keyboardControl: true,
            preloadImages: false,
            lazyLoading: true,
            onInit: this.sliderOnInit.bind(this),
            onSlideChangeStart: this.slideChangeStarting.bind(this),
            onSlideChangeEnd: this.slideChanged.bind(this)
        };
        console.log(this);
        this.checkCache();
        var holder = this;
        window.onbeforeunload = function (e) {
            holder.destroyEvents();
        };
    }
    ngOnDestroy() {
        this.destroyEvents();
    }
    destroyEvents() {
        this.setIsReading();
        if (mangaView != null) {
            mangaView.destroy();
        }
        if (pageScene != null) {
            pageScene.destroy();
        }
        if (pageController != null) {
            pageController.destroy();
        }
        if (driftInstance != null) {
            driftInstance.destroy();
        }
    }
    sliderOnInit(swiper) {
        var pageObj = {
            manga: this.viewerSettings.mangaTitle,
            chapter: this.viewerSettings.chapter,
            page: this.viewerSettings.isPage
        };
        this.viewerSettings.chapterPagesTotal = swiper.slides.length;
        this.viewerSettings.prevChapterShow = (swiper.activeIndex == 0 && this.viewerSettings.chapter > 1);
        this.viewerSettings.hasNextBookmark = this.hasMoreBookmarks(pageObj);
        this.viewerSettings.hasPrevBookmark = this.hasLessBookmarks(pageObj);
    }
    setIsReading() {
        if (this.viewerSettings.isReading) {
            this.viewerSettings.wasReading = {
                manga: this.viewerSettings.whichManga,
                chapter: this.viewerSettings.chapterPosition,
                page: this.viewerSettings.isPage
            };
            localStorage.setItem('osbMangaReader.wasReading', JSON.stringify(this.viewerSettings.wasReading));
        }
    }
    slideChangeStarting(swiper) {
        if (driftInstance) {
            driftInstance.destroy();
        }
    }
    slideChanged(swiper) {
        this.viewerSettings.isPage = swiper.activeIndex + 1;
        var pageObj = {
            manga: this.viewerSettings.mangaTitle,
            chapter: this.viewerSettings.chapter,
            page: this.viewerSettings.isPage
        };
        this.viewerSettings.isBookmark = this.checkBookmark(pageObj);
        this.viewerSettings.hasNextBookmark = this.hasMoreBookmarks(pageObj);
        this.viewerSettings.hasPrevBookmark = this.hasLessBookmarks(pageObj);
        this.setIsReading();
        this.viewerSettings.prevChapterShow = (swiper.activeIndex == 0 && this.viewerSettings.chapter > 1);
        this.viewerSettings.nextChapterShow = (swiper.activeIndex + 1 == swiper.slides.length);
        if (this.viewerSettings.usingMagnifier) {
            this.showMagnifier();
        }
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
        var userSettings = localStorage.getItem('osbMangaReader.user');
        if (userSettings) {
            this.userSettings = JSON.parse(userSettings);
            if (this.userSettings.nightMode) {
                this.setNightMode(true);
            }
        }
        var wasReading = localStorage.getItem('osbMangaReader.wasReading');
        if (wasReading) {
            this.viewerSettings.wasReading = JSON.parse(wasReading);
            this.messageType = 'continue';
            this.showMessage = true;
            this.getSiteFavourites();
        }
        else {
            this.getSiteFavourites();
        }
    }
    initSlider(page) {
        var holder = this;
        if (page) {
            holder.sliderSettings['initialSlide'] = (page - 1);
        }
        else {
            holder.sliderSettings['initialSlide'] = 0;
        }
        setTimeout(function () {
            var viewportSize = window.innerHeight - 20;
            document.querySelector('.osb-manga-reader-holder .swiper-container').setAttribute('style', 'height:' + viewportSize + 'px;');
            mangaView = new Swiper(document.querySelector('.osb-manga-reader-holder .swiper-container'), holder.sliderSettings);
        }, 500);
    }
    setNightMode(isNight) {
        if (isNight) {
            document.body.classList.add('night-time');
        }
        else {
            document.body.classList.remove('night-time');
        }
    }
    toggleNightMode() {
        this.userSettings.nightMode = !this.userSettings.nightMode;
        this.setNightMode(this.userSettings.nightMode);
        localStorage.setItem('osbMangaReader.user', JSON.stringify(this.userSettings));
    }
    showMagnifier() {
        this.viewerSettings.usingMagnifier = !this.viewerSettings.usingMagnifier;
        if (this.viewerSettings.usingMagnifier) {
            driftInstance = new Drift(document.querySelector('.swiper-slide-active img'), {
                paneContainer: document.querySelector('#imageMagnifier')
            });
        }
        else if (driftInstance) {
            driftInstance.destroy();
        }
    }
    hasMoreBookmarks(pageObj) {
        var holder = this, match = false, firstMatch = false;
        this.userSettings.bookmarks.forEach(function (el) {
            if (pageObj.manga === el.manga &&
                pageObj.chapter == el.chapter &&
                pageObj.page < el.page &&
                !firstMatch) {
                firstMatch = true;
                holder.viewerSettings.nextBookmark = { manga: el.manga, chapter: el.chapter, page: el.page };
            }
            if (pageObj.manga === el.manga &&
                pageObj.chapter == el.chapter &&
                pageObj.page < el.page) {
                match = true;
                return false;
            }
        });
        return match;
    }
    hasLessBookmarks(pageObj) {
        var holder = this, match = false;
        this.userSettings.bookmarks.forEach(function (el) {
            if (pageObj.manga === el.manga &&
                pageObj.chapter == el.chapter &&
                pageObj.page > el.page) {
                holder.viewerSettings.prevBookmark = { manga: el.manga, chapter: el.chapter, page: el.page };
                match = true;
                return false;
            }
        });
        return match;
    }
    goToBookmark(bookmark) {
        this.viewerSettings.isBookmark = this.checkBookmark(bookmark);
        mangaView.slideTo(bookmark.page - 1);
    }
    hasBookmarks(manga) {
        var match = false;
        this.userSettings.bookmarks.forEach(function (el) {
            if (manga === el.manga) {
                match = true;
                return false;
            }
        });
        return match;
    }
    checkBookmark(bookmark) {
        var jsonMatcher = JSON.stringify(bookmark);
        var match = false;
        this.userSettings.bookmarks.forEach(function (el) {
            if (JSON.stringify(el) === jsonMatcher) {
                match = true;
                return false;
            }
        });
        return match;
    }
    setBookmark(manga, chapter, page) {
        var bookmark = {
            manga: manga.href,
            chapter: chapter,
            page: page
        };
        if (this.userSettings.bookmarks.length < 1) {
            this.userSettings.bookmarks.push(bookmark);
            localStorage.setItem('osbMangaReader.user', JSON.stringify(this.userSettings));
            this.viewerSettings.isBookmark = this.checkBookmark(bookmark);
        }
        else {
            if (!this.checkBookmark(bookmark)) {
                this.userSettings.bookmarks.push(bookmark);
                localStorage.setItem('osbMangaReader.user', JSON.stringify(this.userSettings));
                this.viewerSettings.isBookmark = this.checkBookmark(bookmark);
            }
        }
    }
    checkFavourite(manga) {
        return (this.userSettings.favourites.indexOf(manga) == -1);
    }
    setFavourite(manga) {
        if (this.userSettings.favourites.length < 1) {
            this.userSettings.favourites.push(manga.href);
            localStorage.setItem('osbMangaReader.user', JSON.stringify(this.userSettings));
        }
        if (this.checkFavourite(manga.href)) {
            this.userSettings.favourites.push(manga.href);
            localStorage.setItem('osbMangaReader.user', JSON.stringify(this.userSettings));
        }
    }
    parseChapter(chapterNum) {
        return parseInt(chapterNum);
    }
    getMangaChapter(manga, chapter, page) {
        var hasPage = false;
        this.isLoading = true;
        this.showMessage = false;
        this.viewerSettings.chapterPosition = chapter;
        this.viewerSettings.chapter = manga.chapters[chapter].chapterId;
        this.viewerSettings.whichManga = manga;
        this.viewerSettings.mangaTitle = manga.href;
        this.viewerSettings.chaptersTotal = manga.chapters.length;
        this.viewerSettings.nextChapterShow = false;
        if (page) {
            hasPage = page;
        }
        let headers = new http_1.Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new http_1.RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite + '/manga/' + manga.href + '/' + this.viewerSettings.chapter, options)
            .subscribe(response => this.setMangaChapter(response, hasPage));
    }
    setMangaChapter(chapter, page) {
        var hasPage = false;
        this.hideMenu = true;
        this.viewerSettings.isPage = 1;
        this.viewerSettings.isBookmark = false;
        this.viewerSettings.isReading = true;
        this.viewerSettings.hasBookmarks = this.hasBookmarks(this.viewerSettings.mangaTitle);
        this.mangaChapter = chapter.json();
        this.section = 'manga-chapter';
        this.isLoading = false;
        if (page) {
            hasPage = page;
        }
        this.initSlider(hasPage);
    }
    getMainMangaList() {
        var holder = this;
        this.viewerSettings.isReading = false;
        if (this.mainListViewData.length > 1) {
            var mainViewData = this.mainListViewData.slice(0, 20);
            mainViewData.forEach(function (element) {
                holder.getMangaDetails(element, 'main-view', false);
                setTimeout(function () {
                    holder.startPagination();
                }, 2000);
            });
            return false;
        }
        let headers = new http_1.Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new http_1.RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite, options)
            .subscribe(response => this.setMainMangaList(response));
    }
    viewMangaDetails(manga) {
        this.mangaInfo = manga;
        this.section = 'manga-info';
    }
    setMainMangaList(data) {
        var holder = this;
        this.mainListViewData = data.json();
        localStorage.setItem('osbMangaReader.mainList', JSON.stringify(this.mainListViewData));
        var mainViewData = this.mainListViewData.slice(0, 20);
        mainViewData.forEach(function (element) {
            holder.getMangaDetails(element, 'main-view', false);
        });
        setTimeout(function () {
            holder.startPagination();
        }, 2000);
    }
    getMoreMainManga() {
        var holder = this;
        var current = holder.mainListViewDisplayPage;
        holder.mainListViewDisplayPage++;
        var mainViewData = this.mainListViewData.slice((holder.mainListViewDisplayPageLength * current), (holder.mainListViewDisplayPageLength * holder.mainListViewDisplayPage));
        mainViewData.forEach(function (element) {
            holder.getMangaDetails(element, 'main-view', false);
        });
        setTimeout(function () {
            var paginationType;
            if (holder.listStyle) {
                paginationType = '#paginationLoaderList';
            }
            else {
                paginationType = '#paginationLoader';
            }
            document.querySelector(paginationType).classList.remove('active');
        }, 2000);
    }
    startPagination() {
        var holder = this, paginationType = '';
        pageController = new ScrollMagic.Controller();
        if (holder.listStyle) {
            paginationType = '#paginationLoaderList';
        }
        else {
            paginationType = '#paginationLoader';
        }
        pageScene = new ScrollMagic.Scene({ triggerElement: paginationType, triggerHook: 'onEnter' })
            .addTo(pageController)
            .on('enter', function (e) {
            if (holder.section == 'main-view') {
                if (document.querySelector(paginationType).className.indexOf('active') == -1) {
                    document.querySelector(paginationType).classList.add('active');
                    holder.getMoreMainManga();
                }
            }
        });
        pageScene.update();
    }
    getMangaDetails(manga, section, cache) {
        var holder = this;
        if (this.mangaDetails.length > 1 && cache) {
            this.mangaDetails.forEach(function (element) {
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
        let headers = new http_1.Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new http_1.RequestOptions({ headers: headers });
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
        this.viewerSettings.isReading = false;
        this.siteFavouritesDisplay = [];
        if (this.siteFavouritesData.length > 1) {
            this.siteFavouritesData.forEach(function (element) {
                holder.getMangaDetails(element, 'site-favourites', true);
            });
            return false;
        }
        this.http.get(this.siteFavouritesUrl)
            .subscribe(response => this.setSiteFavourites(response));
    }
    setSiteFavourites(data) {
        var holder = this;
        this.siteFavouritesData = data.json();
        localStorage.setItem('osbMangaReader.siteFavourites', JSON.stringify(this.siteFavouritesData));
        this.siteFavouritesData.forEach(function (element) {
            holder.getMangaDetails(element, 'site-favourites', true);
        });
    }
};
OsbMangaReader = __decorate([
    core_1.Component({
        selector: 'osb-manga-reader',
        templateUrl: 'vendor/osb-manga-reader/lib/OsbMangaReader.html',
        styleUrls: ['vendor/osb-manga-reader/lib/OsbMangaReader.css']
    }), 
    __metadata('design:paramtypes', [http_1.Http])
], OsbMangaReader);
exports.OsbMangaReader = OsbMangaReader;
//# sourceMappingURL=OsbMangaReader.js.map