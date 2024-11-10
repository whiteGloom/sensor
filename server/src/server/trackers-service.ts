

class TrackersService {
  protected trackers: Tracker[];
  constructor() {
    this.trackers = [];
  }

  addTracker(tracker) {
    this.trackers.push(tracker);
  }

  getTrackers() {
    return this.trackers;
  }
}