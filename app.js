// Budget Controller

var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum,
      sum = 0;
    data.allItems[type].forEach(function (current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      // ID = 0;

      // Generates New ID for each type
      ID =
        data.allItems[type].length >= 1
          ? data.allItems[type][data.allItems[type].length - 1].id + 1
          : 0;

      // Check type and create an object
      if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      }

      // Store data into our data structuer
      data.allItems[type].push(newItem);

      // Returns new element
      return newItem;
    },

    calculateBudget: function () {
      // Calculate total inc and exp
      calculateTotal("inc");
      calculateTotal("exp");

      // Calculate total budget
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate total percentage
      data.percentage =
        data.totals.inc > 0
          ? Math.round((data.totals.exp / data.totals.inc) * 100)
          : -1;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    testing: function () {
      return data;
    },
  };
})();

// UI Controller

var UIController = (function () {
  var DOMSelectors = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    incLabel: ".budget__income--value",
    expLabel: ".budget__expenses--value",
    budgetLabel: ".budget__value",
    expPercentage: ".budget__expenses--percentage",
    container: ".inc-exp-container",
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMSelectors.inputType).value,
        description: document.querySelector(DOMSelectors.inputDescription)
          .value,
        value: parseFloat(
          document.querySelector(DOMSelectors.inputValue).value
        ),
      };
    },
    getDOMSelectors: function () {
      return DOMSelectors;
    },
    addListItem: function (type, obj) {
      var HTML, element;

      if (type === "inc") {
        element = DOMSelectors.incomeContainer;
        HTML = `<div class="item clearfix" id="inc-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">+ ${obj.value}</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
      }
      if (type === "exp") {
        element = DOMSelectors.expensesContainer;
        HTML = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">- ${obj.value}</div>
            <div class="item__percentage">0%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div>
    </div>`;
      }

      // Showing data to the UI
      document.querySelector(element).insertAdjacentHTML("beforeend", HTML);
    },

    displayBudget: function (obj) {
      document.querySelector(DOMSelectors.incLabel).textContent = obj.totalInc;
      document.querySelector(DOMSelectors.expLabel).textContent = obj.totalExp;
      document.querySelector(DOMSelectors.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMSelectors.expPercentage).textContent =
        obj.percentage > 0 ? `${obj.percentage}%` : "--";
    },

    deleteListItem: function (selectorID) {
      document.querySelector(`#${selectorID}`).remove();
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMSelectors.inputDescription + "," + DOMSelectors.inputValue
      );
      fieldsArr = Array.from(fields);
      fieldsArr.forEach((current) => {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
  };
})();

// Middle Controller

var Controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var getDOMSelectors = UICtrl.getDOMSelectors();
    document
      .querySelector(getDOMSelectors.inputBtn)
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", ctrlAddItem);
    document
      .querySelector(getDOMSelectors.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function () {
    var budget;
    // 1 Calculate the Budget
    budgetCtrl.calculateBudget();
    // 2 Get the budget
    budget = budgetCtrl.getBudget();
    // 3 Send the data to UIController
    UICtrl.displayBudget(budget);
    console.log(budget);
  };

  var ctrlAddItem = function (e) {
    if (e.keyCode == 13 || e.which == 13 || e.type == "click") {
      var getInput, newItem;

      // 1. Get the input
      getInput = UICtrl.getInput();

      // Checking input field if they are valid or not
      if (getInput.description !== "" && !isNaN(getInput.value)) {
        // 2 Send data to budgetController
        newItem = budgetCtrl.addItem(
          getInput.type,
          getInput.description,
          getInput.value
        );

        // 3 Send data to the UI Controller
        UICtrl.addListItem(getInput.type, newItem);

        // 4 Clear the fields
        UICtrl.clearFields();

        // 5 Calculate the budget
        updateBudget();
      }
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitItem, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // 1 Collec the type and ID from the DOM
      splitItem = itemID.split("-");
      type = splitItem[0];
      ID = parseInt(splitItem[1]);

      // 2 Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 3 Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 4 Re-calculate and update the budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

Controller.init();
