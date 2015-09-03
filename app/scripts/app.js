'use strict';

/**
 * @ngdoc overview
 * @name bluereconlineApp
 * @description
 * # bluereconlineApp
 *
 * Main module of the application.
 */
angular
  .module('bluereconlineApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-md5',
    'angular-jwt',
    'angular-loading-bar',
    'ui.utils',
    'infinite-scroll',
    'uiGmapgoogle-maps',
    'mgcrea.ngStrap',
    'ui.rCalendar',
    'bluereconlineApp.apiconfig',
    'dynform',
    'ui.checkbox',
    'ngAutocomplete',
    'rzModule',
    'ui.select',
    'vButton'
  ])
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }])

    .config(function ($routeProvider,$httpProvider,$locationProvider) {
        $routeProvider
            .when('/:orgurl', {
                templateUrl: 'views/programs.html',
                controller: 'ProgramList'
            })
            .when('/:orgurl/home', {
                templateUrl: 'views/home.html',
                controller: 'HomeCtrl',
                controllerAs: 'home'
            })
            .when('/:orgurl/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'log'
            })
            .when('/:orgurl/myaccount', {
                templateUrl: 'views/userSettings/myAccount.html',
                controller: 'MyAccountCtrl'
            })
            .when('/:orgurl/household', {
                templateUrl: 'views/userSettings/household.html',
                controller: 'MyHouseholdCtrl'
            })
            .when('/:orgurl/purchases', {
                templateUrl: 'views/userSettings/purchases.html',
                controller: 'MyPurchasesCtrl'
            })
            .when('/:orgurl/programs', {
                templateUrl: 'views/programs.html',
                controller: 'ProgramList'
            })
            .when('/:orgurl/programinfo/:itemid', {
                templateUrl: 'views/programinfo.html',
                controller: 'ProgramInfo'
            })
            .when('/:orgurl/register/:itemid', {
                templateUrl: 'views/programRegister.html',
                controller: 'ProgramRegister',
                controllerAs: 'proReg'
            })
            .when('/:orgurl/memberships', {
                templateUrl: 'views/memberships.html'
            })
            .when('/:orgurl/membershipsignup/:itemid', {
                templateUrl: 'views/membershipRegister.html',
                controller: 'MembershipRegister',
                controllerAs: 'memReg'
            })
            .when('/:orgurl/reservations', {
                templateUrl: 'views/requestReservation.html'
            })
            .when('/:orgurl/addedtocart', {
                templateUrl: 'views/addedToCart.html',
                controller: 'HomeCtrl',
                controllerAs: 'home'
            })
            .otherwise({
                redirectTo: '/:orgurl/login'
            });


        $locationProvider.html5Mode();

        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.common.Accept = 'application/json';
    })

    .run(['$rootScope','$location', '$routeParams', '$anchorScroll', 'ActiveUser', function($rootScope, $location, $routeParams, $anchorScroll, ActiveUser) {
        $rootScope.$on('$routeChangeSuccess', function () {
            $anchorScroll('pageTop');
        });

        ActiveUser.getFromLocal();

        $rootScope.$on('$routeChangeStart', function (event, next) {
            if(next.params.orgurl !== undefined) {

                if (next.requireLogin) {
                    $location.path('/' + next.params.orgurl + '/login');
                    event.preventDefault();
                }
            }
        });
    }])

    .directive('ensureUnique', ['dataService', function (dataService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.bind('blur', function () {
                    if (!ngModel || !element.val()) {return;}
                    var keyProperty = scope.$eval(attrs.ensureUnique);
                    var currentValue = element.val();
                    dataService.checkUniqueValue(keyProperty.property, currentValue)
                        .success(function (unique) {
                            //Ensure value that being checked hasn't changed
                            //since the Ajax call was made
                            //console.log('unique result');
                            //console.log(unique.isUnique);
                            if (currentValue === element.val()) {
                                ngModel.$setValidity('unique', unique.isUnique);
                            }
                        }, function () {
                            //console.log('looks like an error');
                            //Probably want a more robust way to handle an error
                            //For this demo we'll set unique to true though
                            ngModel.$setValidity('unique', true);
                        });
                });
            }
        };
    }])
    .directive('sameAs', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attrs, ngModel) {
                function validate(value) {
                    var isValid = scope.$eval(attrs.sameAs) === value;

                    //console.log(isValid);

                    ngModel.$setValidity('match', isValid);

                    if(isValid)
                    {
                        //console.log('values match');
                    }
                    else
                    {
                        //console.log('values do not match');
                    }


                    return isValid ? value : undefined;
                    //return isValid;
                }

                //console.log('sameAs directive loaded');

                ngModel.$parsers.unshift(validate);

                // Force-trigger the parsing pipeline.
                scope.$watch(attrs.sameAs, function() {
                        //console.log('Trying to validate');
                        ngModel.$setViewValue(ngModel.$viewValue);
                });
            }
        };
    })
    .factory('dataService', ['$http', 'BLUEREC_ONLINE_CONFIG', function ($http,BLUEREC_ONLINE_CONFIG) {
        var dataFactory = {};

        dataFactory.checkUniqueValue = function (property, value) {
            return $http.get(BLUEREC_ONLINE_CONFIG.API_URL + '/unique?field=' + property + '&check=' + value)
                    .success(function (response) {
                        return response.isUnique;
                    })
                    .error(function (response) {
                        return response.isUnique;
                    }
                    );
        };
        return dataFactory;
    }])
    .service('ShoppingCart', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http, BLUEREC_ONLINE_CONFIG, $routeParams) {
        var cart = this;
        cart.cartCount = 0;

        function updateShoppingCart() {
            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/login',
                headers: {
                    'Content-Type': undefined
                },
                data: {}
            };

            return $http(req)
                .then(
                function success(response) {
                    return response;
                }
            );
        }

        cart.updateShoppingCart = updateShoppingCart;
    }])
    .service('ActiveUser', ['AuthService','$window','$q',function(AuthService,$window,$q) {
        var currentUser = this;
        currentUser.userStore = $window.localStorage;
        currentUser.userKey = 'user-data';
        currentUser.userData = {};
        currentUser.gettingUser = false;

        // constructor
        function setActiveUser(userData)
        {
          var deferred = $q.defer();

            deferred.notify('Setting user in local storage.');

            putUserInLocalStorage(userData).then(function(response) {
                currentUser.userData = userData;
                deferred.resolve(response);
              },
              function(response) {
                deferred.reject(response);
              }
            );


          return deferred.promise;
        }

        function getFromLocal()
        {
          var deferred = $q.defer();

        deferred.notify('Looking for user in local storage.');

        if (pullUserFromLocalStorage()) {
          currentUser.userData = pullUserFromLocalStorage();
          console.log(currentUser.userData);
          deferred.resolve(currentUser.userData);
        } else {
          deferred.reject('No user data found in local storage');
        }

          return deferred.promise;
        }

        function pullUserFromLocalStorage()
        {
          return angular.fromJson(JSON.parse(currentUser.userStore.getItem(currentUser.userKey)));
        }

        function putUserInLocalStorage(response)
        {
          var deferred = $q.defer();

          setTimeout(function() {
            deferred.notify('Trying to put user in local storage.');

            currentUser.userStore.setItem(currentUser.userKey, JSON.stringify(angular.toJson(response)));

            deferred.resolve(true);
          }, 100);

          return deferred.promise;
        }

        function getFromToken()
        {
          if(AuthService.getToken())
          {
            currentUser.checkUser();
          }
        }

        function getUser()
        {
          return currentUser.userData;
        }

        function isLoggedIn()
        {
            var loggedIn=false;

            if(currentUser.userData!==null) {
                loggedIn=(currentUser.userData.validLogin === true);
            }
            return loggedIn;
        }

        function setUser(data)
        {
          currentUser.setActiveUser(data);
        }

        function checkUser() {
          currentUser.gettingUser = true;
          AuthService.getUser().then(function success(response) {
            currentUser.setActiveUser(response.data);
            putUserInLocalStorage(response.data);
            //currentUser.userStore.setItem(currentUser.userKey, JSON.stringify(angular.toJson(response.data)));
            currentUser.gettingUser = false;
          });
        }

        currentUser.getUser = getUser;
        currentUser.setActiveUser = setActiveUser;
        currentUser.getFromToken = getFromToken;
        currentUser.setUser = setUser;
        currentUser.checkUser = checkUser;
        currentUser.getFromLocal = getFromLocal;

        currentUser.isLoggedIn = isLoggedIn;

        currentUser.getFromToken();

        return currentUser;
    }])
    .factory('AuthService', ['$http', '$q', 'md5', 'BLUEREC_ONLINE_CONFIG', 'AuthToken', '$routeParams', function($http,$q,md5,BLUEREC_ONLINE_CONFIG, AuthToken,$routeParams) {
        return {
            login: function (loginemail,passwd) {
                var pdata = {};
                pdata.loguname = loginemail;
                pdata.check = md5.createHash(passwd || '');

                var req = {
                    method: 'POST',
                    url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/login',
                    headers: {
                        'Content-Type': undefined
                    },
                    data: {'lname': pdata.loguname, 'lpass':pdata.check}
                };

                return $http(req)
                    .then(
                    function success(response) {
                        AuthToken.setToken(response.data.token);
                        return response;
                    }
                );
            },
            logout: function() {
                AuthToken.setToken();
            },
            getToken: function() {
                return AuthToken.getToken();
            },
            getUser: function() {
                if(AuthToken.getToken())
                {
                    var req = {
                        method: 'GET',
                        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/remember',
                        headers: {
                            'Content-Type': undefined
                        }
                    };

                    return $http(req)
                        .then(
                        function success(response) {
                            return response;
                        }
                    );
                }
                else
                {
                    $q.reject({data: 'No Auth Token Found'});
                }
            }
        };
    }])
    .factory('AuthToken', ['$window', function($window) {
        var store = $window.localStorage;
        var key = 'auth-token';
        var userKey = 'user-data';

        function getToken() {
            return store.getItem(key);
        }

        function setToken(token) {
            if(token) {
                store.setItem(key,token);
            }
            else {
                store.removeItem(key);
                store.removeItem(userKey);
            }
        }

        return {
            getToken: getToken,
            setToken: setToken
        };
    }])
    .factory('AuthInterceptor', ['AuthToken', function AuthInterceptor(AuthToken) {

        function addToken(config) {
            var token = AuthToken.getToken();

            //console.log('config:');
            //console.log(config);

            if(token && config.skipAuthorization !== true) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        }

        return{
            request:addToken
        };
    }])
    .factory('MemInfoLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
        var memLoad = this;

        var loadMembership = function() {

            if(memLoad.busy) {
                return false;
            }
            memLoad.busy = true;

            var req = {
                method: 'GET',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/membershiptypes/' + $routeParams.itemid,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            $http(req).then(function(response) {
                var responseData;

                responseData = JSON.parse(angular.toJson(response.data));
                memLoad.returnData = responseData.data[0];

                memLoad.busy = false;
            }.bind(this));
        };

        memLoad.loadMembership = loadMembership;
        memLoad.returnData = '';
        memLoad.busy = false;

        return memLoad;
    }])
    .factory('CustomFieldLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
        var cfLoad = this;

        var loadCustomFields = function(userID) {
            if(cfLoad.busy) {
                return false;
            }
            cfLoad.busy = true;

            console.log('received ' + userID + ' as user id');

            var req = {
                method: 'POST',
                url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/secured/item/' + $routeParams.itemid + '/customfields',
                headers: {
                    'Content-Type': undefined
                },
                data: {'uid':userID}
            };

            $http(req).then(function(response) {
                var responseData;
                responseData = JSON.parse(angular.toJson(response.data));
                cfLoad.returnData = responseData;
                cfLoad.busy = false;
            }.bind(this));
        };

        cfLoad.loadCustomFields = loadCustomFields;
        cfLoad.returnData = '';
        cfLoad.busy = false;

        return cfLoad;
    }])
  .factory('ProInfoLoader', ['$http', 'BLUEREC_ONLINE_CONFIG', '$routeParams', function($http,BLUEREC_ONLINE_CONFIG,$routeParams) {
    var proload = this;

    var loadProgram = function() {

      if(proload.busy) {
        return false;
      }
      proload.busy = true;

      var req = {
        method: 'GET',
        url: BLUEREC_ONLINE_CONFIG.API_URL + '/ORG/' + $routeParams.orgurl + '/programinfo/' + $routeParams.itemid,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      $http(req).then(function(response) {
        var responseData = [];
        var mapData = [];

        mapData.center = '';
        mapData.marker = [];

        responseData = JSON.parse(angular.toJson(response.data));
        responseData.datesNotEmpty = (responseData.prodates && responseData.prodates.length)?true:false;

        angular.forEach(responseData.locations, function(value, key) {
          //console.log('Key: ' + responseData.locations[key].geo_address);

          var codeReq = {
            method: 'GET',
            skipAuthorization: true,
            url: 'https://maps.google.com/maps/api/geocode/json?address=' + responseData.locations[key].geo_address + '&sensor=false',
            headers: {
              'Content-Type': 'application/json'
            }
          };

          $http(codeReq).success(function(geoData) {
            //console.log(geoData);
            var tempData = [];
            tempData.center = '';
            tempData.marker = [];
            var centerMap = { latitude: geoData.results[0].geometry.location.lat, longitude: geoData.results[0].geometry.location.lng };
            var marker = [];
            marker.id = responseData.locations[key].location_name;
            marker.location = { latitude: geoData.results[0].geometry.location.lat, longitude: geoData.results[0].geometry.location.lng };
            tempData.center = centerMap;
            tempData.marker = marker;
            mapData.push(tempData);
            mapData.mapOptions = {scrollwheel: false,draggable:false};
          });
        });

        responseData.mapData = mapData;

        proload.returnData = responseData;

        proload.busy = false;
      }.bind(this));
    };

    proload.loadProgram = loadProgram;
    proload.returnData = '';
    proload.busy = false;

    return proload;
  }]);
