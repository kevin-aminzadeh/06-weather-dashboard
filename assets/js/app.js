// Storage Abstract Service Class Definition
class appStorageService {
  constructor() {
    this.savedItems;
  }

  getItems() {
    this.savedItems = JSON.parse(localStorage.getItem("searchHistory"));
  }

  saveItem() {}

  clearItems() {}
}
