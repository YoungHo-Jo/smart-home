'use strict';

exports.__esModule = true;
exports.clearResponseCache = exports.clearRequestCache = exports.isRequestInFlight = exports.getRequestKey = exports.fetchDedupe = exports.Fetch = undefined;

var _fetch = require('./fetch');

var _fetchDedupe = require('fetch-dedupe');

exports.Fetch = _fetch.Fetch;
exports.fetchDedupe = _fetchDedupe.fetchDedupe;
exports.getRequestKey = _fetchDedupe.getRequestKey;
exports.isRequestInFlight = _fetchDedupe.isRequestInFlight;
exports.clearRequestCache = _fetchDedupe.clearRequestCache;
exports.clearResponseCache = _fetch.clearResponseCache;