(function () {
    angular.module("TodoApp").controller("TodoController", TodoController);

    function TodoController($http, $rootScope, $mdSidenav, $mdToast, $filter, $scope, todoService) {
        var vm = this;
        var deregisters = [];
        vm.loading = false;
        vm.items = [];

        $http.defaults.transformRequest.push(function (config) {
            vm.loading = true;
            return config;
        });
        $http.defaults.transformResponse.push(function (response) {
            vm.loading = false;
            return response;
        });

        deregisters.push($rootScope.$on("todosChanged", reloadTodoList));
        deregisters.push($rootScope.$on("errorResponse", handleError));
        $scope.$on("$destroy", destroyThis);

        vm.sortableOptions = {
            placeholder: "app",
            activate: function (x, y) {
                y.item.addClass("dragging");
            },
            deactivate: function (x, y) {
                y.item.removeClass("dragging");
            },
            stop: function () {
                todoService.updateOrder(vm.items);
            }
        };

        vm.submitForm = function () {
            if (vm.newTodoForm.$valid) {
                todoService.createTodo(vm.newTodo);
                vm.newTodo = "";
            }
        };

        vm.todoUpdated = function (todo) {
            todoService.updateTodo(todo);
        };

        vm.todoDeleted = function (todo) {
            todoService.deleteTodo(todo.id);
        };

        vm.todoCompleteDeleted = function () {
            $filter("filter")(vm.items, {isComplete: true}).forEach(vm.todoDeleted);
        };

        function reloadTodoList() {
            vm.items = todoService.getTodoList().slice();
        }

        function handleError(event, errorText, errorStatus, requestAction, requestOb) {
            vm.error = "Failed to " + requestAction + " " + requestOb + ". Server returned " + errorStatus + " - " + errorText;
            $mdToast.show($mdToast.simple().content(vm.error));
        }

        function destroyThis() {
            deregisters.forEach(eventDereg);
        }
    }
})();
