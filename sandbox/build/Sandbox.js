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
const platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
const components_1 = require('osb-component-test/components');
let Sandbox = class Sandbox {
    constructor() {
        console.log('Loaded');
    }
};
Sandbox = __decorate([
    core_1.Component({
        selector: 'sandbox',
        directives: [components_1.OsbComponentTest],
        template: `<osb-component-test></osb-component-test>`
    }), 
    __metadata('design:paramtypes', [])
], Sandbox);
exports.Sandbox = Sandbox;
platform_browser_dynamic_1.bootstrap(Sandbox);
//# sourceMappingURL=Sandbox.js.map