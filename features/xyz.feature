Feature: building stones

  Scenario: sync messaging with read and write
    When I write data on xyz
    Then I should be able to read the data from xyz

  Scenario: async messaging with await and write
    When I am waiting for data on xyz
    Then I should get the data when xyz is written

  Scenario: async messaging and notification with pull
    When I pull data from xyz
    Then xyz should be notified about the pull
    And I should get the data when xyz is written

  Scenario: async messaging and notification with push
    When I push data to xyz
    Then xyz should be notified about the push
    And I should be able to read the data from xyz

  Scenario: reading without data leads to failure
    When I don't write data on xyz
    Then I should not be able to read data from xyz
