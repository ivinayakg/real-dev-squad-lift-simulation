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

// the newState of the application
// const newState = {
//   lifts: [{ id: generateId(), currentFloor: 1 }],
//   floors: 1,
// };
const newState = {
  lifts: [],
  floors: 0,
};

let workQueue = [];

// dom elemets are present here
const mainHolder = document.querySelector(".main");
const liftsStatus = document.querySelector(".status_lifts");
const floorsStatus = document.querySelector(".status_floors");
const updateButton = document.querySelector(".header_add>button");
const addLiftInput = document.querySelector(".lift_input");
const addFloorInput = document.querySelector(".floor_input");

const updateLifts = () => {
  liftsStatus.innerText = "Lifts :- " + newState.lifts.length;
};
const updateFloors = () => {
  floorsStatus.innerText = "Floors :- " + newState.floors;
};

const updateLiftFloor = (liftID, newFloor) =>
  (newState.lifts[
    newState.lifts.findIndex((entry) => liftID === entry.id)
  ].currentFloor = newFloor);

//add lift or floor events
updateButton.addEventListener("click", () => {
  newState.floors = Number(addFloorInput.value);
  newState.lifts.length = 0;
  for (let x of [...new Array(Number(addLiftInput.value))]) {
    newState.lifts.push({ id: generateId(), currentFloor: 1 });
  }
  updateLifts();
  updateFloors();
  createWorkQueue();
  requestIdleCallback(updateDomWithState);
});

function createWorkQueue() {
  workQueue.length = 0;
  mainHolder.innerHTML = "";
  let liftWrapper = document.createElement("div");
  liftWrapper.classList.add("lift_wrapper");

  let index = newState.floors
  for (let x = 0; x < newState.floors; x++) {
    workQueue.push(() => createFloor({ mainHolder, index : index--}));
  }
  workQueue.push(() => mainHolder.append(liftWrapper));
  newState.lifts.forEach((lift) => {
    workQueue.push(() => createLift(liftWrapper, lift));
  });
}

function updateDomWithState(deadline) {
  let shouldCancel = false;
  let currentTask = 0;
  while (!shouldCancel && workQueue.length !== currentTask) {
    workQueue[currentTask]();
    currentTask++;
    shouldCancel = deadline.timeRemaining() < 1.5;
  }
  if (workQueue.length !== currentTask) {
    requestIdleCallback(updateDomWithState);
  }
}

function createFloor({mainHolder, index}) {
  const floor = document.createElement("div");
  floor.classList.add("floor");
  if (index === newState.floors) floor.classList.add("floor_first");

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

function createLift(liftWrapper, lift) {
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
}

function jumpToFloor(floorToReach) {
  let lift;
  let liftIndex;
  for (let x of newState.lifts) {
    if (pubsub.que.find((event) => event.floorToReach === floorToReach)) continue;
    if (!pubsub.que.find((event) => event.id === x.id)) {
      lift = x;
      liftIndex = newState.lifts.indexOf(x);
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
  const floorDiff = Math.abs(event.floorToReach - event.currentFloor);

  liftToTravel.style.transform = `translateY(${floorsToTravel * 120 * -1}px)`;
  liftToTravel.style.transition = `transform ${2000 * floorDiff}ms ease-in-out`;
  updateLiftFloor(event.id, event.floorToReach);

  setTimeout(() => {
    liftToTravel.classList.toggle("lift--active");
  }, 2000 * floorDiff);
  setTimeout(() => {
    liftToTravel.classList.toggle("lift--active");
  }, 2000 * floorDiff + 2500);
  setTimeout(() => {
    pubsub.popFromQue(event.id);
  }, 2000 * floorDiff + 5000);
}
