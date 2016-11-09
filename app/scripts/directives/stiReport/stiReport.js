angular.module('stiReport', [])
    .directive('stiReport', function($window, $q) {
        var controller = function ($scope, $window) {
                //console.log('reportName', $scope.reportName);
                //console.log('reportData', $scope.reportData);

                function init() {
                    $scope.viewer = new $window.Stimulsoft.Viewer.StiViewer(null, 'StiViewer', false);
                    $scope.report = new $window.Stimulsoft.Report.StiReport();
                };

                init();
            },

            template = '<div id="viewer"></div>';

        return {
            restrict: 'A',
            template: template,
            scope: {
                reportName: "=",
                reportData: "="
            },
            link: function(scope, element, attrs) {
                scope.$watch("reportName",function(newValue,oldValue) {
                    if(!angular.isUndefined(newValue))
                    {
                        var promise = setReportData();
                        promise.then(function(greeting) {

                        }, function(reason) {

                        });
                    }
                });
                scope.$watch("reportData",function(newValue,oldValue) {
                   // console.log('reportData change', newValue + '   |   ' + oldValue);
                    if(!angular.isUndefined(newValue))
                    {
                        var promise = setReportData();
                        promise.then(function() {

                        });
                    }
                });

                function setReportData()
                {
                    return $q(function() {
                        if(!angular.isUndefined(scope.reportName) && !angular.isUndefined(scope.reportData) && !angular.equals({}, scope.reportData))
                        {
                            var options = new $window.Stimulsoft.Viewer.StiViewerOptions();
                            options.appearance.scrollbarsMode = true;
                            options.appearance.fullScreenMode = false;
                            options.toolbar.showFullScreenButton = false;
                            options.toolbar.showFindButton = false;
                            options.toolbar.showAboutButton = false;
                            options.toolbar.showViewModeButton = false;
                            options.toolbar.viewMode = 	$window.Stimulsoft.Viewer.StiWebViewMode.WholeReport;
                            //options.toolbar.printDestination = $window.Stimulsoft.Viewer.StiPrintDestination.Direct;
                            options.appearance.htmlRenderMode = $window.Stimulsoft.Report.Export.StiHtmlExportMode.Table;

                            scope.viewer = new $window.Stimulsoft.Viewer.StiViewer(options, 'StiViewer', false);
                            scope.report = new $window.Stimulsoft.Report.StiReport();

                            scope.report.loadFile('/reports/'+scope.reportName+'.mrt');

                            scope.report.dictionary.databases.clear();

                            scope.report.regData("report_data", "report_data", scope.reportData);

                            scope.viewer.report = scope.report;

                            scope.viewer.renderHtml('viewer');
                        }
                    });
                }
            },
            controller: controller
        };
    });