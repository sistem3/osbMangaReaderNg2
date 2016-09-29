import {Component} from '@angular/core';
import { Http, HTTP_PROVIDERS, Headers, RequestOptions } from '@angular/http';
import 'Swiper';
import 'ScrollMagic';
declare let ScrollMagic;
declare let Swiper;
let mangaView;
let pageScene, pageController;

@Component({
    selector: 'osb-manga-reader',
    templateUrl: 'node_modules/osb-manga-reader/lib/OsbMangaReader.html',
    styleUrls: ['node_modules/osb-manga-reader/lib/OsbMangaReader.css']
})
export class OsbMangaReader {
    section = '';
    baseUrl = '';
    defaultSite = '';
    apiKey = '';
    isLoading = true;
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
    mainListViewDisplayPage = 1;
    mainListViewDisplayPageLength = 20;

    sliderSettings = {};
    viewerSettings = {
        whichManga: {},
        mangaTitle: '',
        chapter: 1,
        chaptersTotal: 0,
        chapterPagesTotal: 0,
        isPage: 1,
        isBookmark: false,
        hasBookmarks: false,
        hasNextBookmark: false,
        hasPrevBookmark: false,
        nextBookmark: {},
        prevBookmark: {}
    };
    userSettings = {
        bookmarks: [],
        favourites: []
    };

    constructor(public http: Http) {
        // Initial Settings
        this.section = 'site-favourites';
        // API Settings
        this.baseUrl = 'https://doodle-manga-scraper.p.mashape.com/';
        this.apiKey = 'xiQSdA9ACbmshUxnm4ZBC8nn2umSp1LeqQfjsnnVeMWHHSIQy0';
        this.defaultSite = 'mangareader.net';
        // App Favourites Settings
        this.siteFavouritesUrl = 'http://private-e00abd-osbmangareader.apiary-mock.com/topfeed';
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
        console.log(this);
        this.checkCache();
    }

    sliderOnInit(swiper) {
        var pageObj = {
            manga: this.viewerSettings.mangaTitle,
            chapter: this.viewerSettings.chapter,
            page: this.viewerSettings.isPage
        };
        this.viewerSettings.chapterPagesTotal = swiper.slides.length;
        this.viewerSettings.hasNextBookmark = this.hasMoreBookmarks(pageObj);
        this.viewerSettings.hasPrevBookmark = this.hasLessBookmarks(pageObj);
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

        var userSettings = localStorage.getItem('osbMangaReader.user');
        if (userSettings) {
            this.userSettings = JSON.parse(userSettings);
        }
        this.getSiteFavourites();
    }

    initSlider() {
        var holder = this;
        setTimeout(function(){
            var viewportSize = window.innerHeight - 20;
            document.querySelector('.osb-manga-reader-holder .swiper-container').setAttribute('style','height:' + viewportSize + 'px;');
            mangaView = new Swiper(document.querySelector('.osb-manga-reader-holder .swiper-container'), holder.sliderSettings);
        }, 500);
    }

    hasMoreBookmarks(pageObj) {
        var holder = this, match = false, firstMatch = false;
        this.userSettings.bookmarks.forEach(function(el) {
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
        this.userSettings.bookmarks.forEach(function(el) {
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
        this.viewerSettings.isBookmark  = this.checkBookmark(bookmark);
        mangaView.slideTo(bookmark.page - 1);
    }

    hasBookmarks(manga) {
        var match = false;
        this.userSettings.bookmarks.forEach(function(el){
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
        this.userSettings.bookmarks.forEach(function(el) {
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
        } else {
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

    getMangaChapter(manga, chapter) {
        this.isLoading = true;
        this.viewerSettings.chapter = chapter;
        this.viewerSettings.whichManga = manga;
        this.viewerSettings.mangaTitle = manga.href;
        this.viewerSettings.chaptersTotal = manga.chapters.length;
        let headers = new Headers({ 'X-Mashape-Authorization': this.apiKey });
        let options = new RequestOptions({ headers: headers });
        this.http.get(this.baseUrl + this.defaultSite  + '/manga/' + manga.href + '/' + chapter, options)
            .subscribe(response => this.setMangaChapter(response));
    }

    setMangaChapter(chapter) {
        this.viewerSettings.isPage = 1;
        this.viewerSettings.isBookmark = false;
        this.viewerSettings.hasBookmarks = this.hasBookmarks(this.viewerSettings.mangaTitle);
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
                setTimeout(function () {
                    holder.startPagination();
                }, 2000);
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
        var holder = this;
        this.mainListViewData = data.json();
        localStorage.setItem('osbMangaReader.mainList', JSON.stringify(this.mainListViewData));

        var mainViewData = this.mainListViewData.slice(0, 20);
        mainViewData.forEach(function(element) {
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
        mainViewData.forEach(function(element) {
            holder.getMangaDetails(element, 'main-view', false);
        });

        setTimeout(function () {
            var paginationType;
            if (holder.listStyle) {
                paginationType = '#paginationLoaderList';
            } else {
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
        } else {
            paginationType = '#paginationLoader';
        }
        pageScene = new ScrollMagic.Scene({triggerElement: paginationType, triggerHook: 'onEnter'})
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
    }

    setSiteFavourites(data) {
        var holder = this;
        this.siteFavouritesData = data.json();
        localStorage.setItem('osbMangaReader.siteFavourites', JSON.stringify(this.siteFavouritesData));
        this.siteFavouritesData.forEach(function(element) {
            holder.getMangaDetails(element, 'site-favourites', true);
        });
    }

}