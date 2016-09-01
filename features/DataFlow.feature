Feature: building stones

  Scenario: sync messaging with read and write
    When I write data on a data flow
    Then I should be able to read the data from it

  Scenario: async messaging with await and write
    When I am waiting for data on a data flow
    Then I should get the data when it is written

  Scenario: async messaging and notification with pull
    When I pull data from a data flow
    Then that data flow should be notified about the pull
    And I should get the data when it is written

  Scenario: async messaging and notification with push
    When I push data to a data flow
    Then that data flow should be notified about the push
    And I should be able to read the data from it

  Scenario: reading without data leads to failure
    When I don't write data on a data flow
    Then I should not be able to read data from it
