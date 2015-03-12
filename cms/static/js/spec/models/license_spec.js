define(["js/models/license"], function(LicenseModel) {
  describe("License model", function() {
    beforeEach(function() {
      this.model = new LicenseModel()
    });

    it("should be empty by default", function() {
      expect(this.model.get("type")).toEqual("");
    });
  })
})
