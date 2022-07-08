// import "./styles.css";

//generate lift id
const generateId = () => (Math.random() * 1000000).toFixed();
const moveLiftEvent = new Event("move-lift");

// pub sub implementation here
function PubSub() {
  this.que = [];

  this.addToQue = function (event) {
    this.que.push(event);
  };

  this.popFromQue = function (queId) {
    this.que = this.que.filter((event) => event.id !== queId);
  };

  this.shiftFromQue = function () {
    this.que.shift();
  };

  this.emptyQue = function () {
    this.que = [];
  };
}

const pubsub = new PubSub();

// the state of the application
const state = {
  lifts: [{ id: generateId(), currentFloor: 1 }],
  floors: 1,
};

// dom elemets are present here
const mainHolder = document.querySelector(".main");
const liftsStatus = document.querySelector(".status_lifts");
const floorsStatus = document.querySelector(".status_floors");
const addLiftBtn = document.querySelector(".header_addLift");
const addFloorBtn = document.querySelector(".header_addFloor");

const updateLifts = () => {
  liftsStatus.innerText = "Lifts :- " + state.lifts.length;
};
const updateFloors = () => {
  floorsStatus.innerText = "Floors :- " + state.floors;
};

const updateLiftFloor = (liftID, newFloor) =>
  (state.lifts[
    state.lifts.findIndex((entry) => liftID === entry.id)
  ].currentFloor = newFloor);

//add lift or floor events
addFloorBtn.addEventListener("click", () => {
  state.floors += 1;
  updateFloors();
  updateDomWithState();
});
addLiftBtn.addEventListener("click", () => {
  state.lifts.push({ id: generateId(), currentFloor: 1 });
  updateLifts();
  updateDomWithState();
});

function updateDomWithState() {
  mainHolder.innerHTML = "";
  state.lifts = state.lifts.map((lift) => ({ ...lift, currentFloor: 1 }));

  for (let index = state.floors; index > 0; index--) {
    const floor = document.createElement("div");
    floor.classList.add("floor");
    if (index === state.floors) floor.classList.add("floor_first");

    const lowerButton = document.createElement("button");
    lowerButton.classList.add("floor_lowerButton");
    lowerButton.innerText = "^";
    const upperButton = document.createElement("button");
    upperButton.classList.add("floor_upperButton");
    upperButton.innerText = "^";

    lowerButton.onclick = () => jumpToFloor(index);
    upperButton.onclick = () => jumpToFloor(index);

    const buttonWrapper = document.createElement("button");
    buttonWrapper.classList.add("floor_buttonWrapper");
    buttonWrapper.append(upperButton);
    buttonWrapper.append(lowerButton);

    floor.append(buttonWrapper);

    mainHolder.append(floor);
  }
  let liftWrapper = document.createElement("div");
  liftWrapper.classList.add("lift_wrapper");

  state.lifts.forEach((lift, index) => {
    let liftNode = document.createElement("span");
    let rightDoor = document.createElement("span");
    let leftDoor = document.createElement("span");
    rightDoor.classList.add("lift_rightD");
    leftDoor.classList.add("lift_leftD");
    liftNode.append(leftDoor);
    liftNode.append(rightDoor);
    liftNode.classList.add("lift");
    liftNode.classList.add(`lift-${lift.id}`);
    liftWrapper.append(liftNode);
  });
  mainHolder.append(liftWrapper);
}

function jumpToFloor(floorToReach) {
  let lift;
  let liftIndex;
  for (let x of state.lifts) {
    if (pubsub.que.find((event) => event.floorToReach === floorToReach))
      continue;
    if (!pubsub.que.find((event) => event.id === x.id)) {
      lift = x;
      liftIndex = state.lifts.indexOf(x);
      break;
    }
  }
  if (!lift || (!liftIndex && liftIndex !== 0)) return;
  let event = { ...lift, floorToReach };
  pubsub.addToQue(event);
  handleEvent(event);
}

function handleEvent(event) {
  const floorsToTravel = Math.abs(event.floorToReach - 1);
  let liftToTravel = document.querySelector(`.lift-${event.id}`);

  liftToTravel.style.transform = `translateY(${floorsToTravel * 120 * -1}px)`;
  liftToTravel.style.transition = `transform ${
    2000 * Math.abs(event.floorToReach - event.currentFloor)
  }ms ease-in-out`;
  updateLiftFloor(event.id, event.floorToReach);

  setTimeout(() => {
    liftToTravel.classList.toggle("lift--active");
  }, 2000 * floorsToTravel);
  setTimeout(() => {
    liftToTravel.classList.toggle("lift--active");
  }, 2000 * floorsToTravel + 2500);
  setTimeout(() => {
    pubsub.popFromQue(event.id);
  }, 2000 * floorsToTravel + 5000);
}

updateLifts();
updateFloors();
updateDomWithState();
