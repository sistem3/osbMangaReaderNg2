import { Http } from '@angular/http';
import 'Swiper';
export declare class OsbMangaReader {
    http: Http;
    isLoading: boolean;
    section: string;
    baseUrl: string;
    defaultSite: string;
    apiKey: string;
    listStyle: boolean;
    mangaDetails: any[];
    mangaInfo: {};
    mangaChapter: {};
    siteFavouritesUrl: string;
    siteFavouritesData: any[];
    siteFavouritesDisplay: any[];
    mainListViewData: any[];
    mainListViewDisplay: any[];
    mainListViewDisplayCount: number;
    sliderSettings: {};
    constructor(http: Http);
    checkCache(): void;
    initSlider(): void;
    getMangaChapter(manga: any, chapter: any): void;
    setMangaChapter(chapter: any): void;
    getMainMangaList(): boolean;
    viewMangaDetails(manga: any): void;
    setMainMangaList(data: any): void;
    getMangaDetails(manga: any, section: any, cache: any): boolean;
    setMangaDetails(manga: any, section: any, cache: any): void;
    getSiteFavourites(): boolean;
    setSiteFavourites(data: any): void;
}
