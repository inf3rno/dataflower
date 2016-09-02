Feature: data flows

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

  Scenario: reading dry flow leads to failure
    When I don't write data on a data flow
    Then I should not be able to read data from it

  Scenario: writing an exhausted flow leads to failure
    When I have an exhausted flow
    Then I should not be able to write on it

  Scenario: awaiting a dry and exhausted flow leads to failure
    When I have a dry and exhausted flow
    Then I should not be able to await it

  Scenario: awaiting a non-dry but exhausted flow
    When I have a non-dry but exhausted flow
    Then I should be able to await the rest of the data from it

  Scenario: awaiting a flow which gets dry and exhausted meanwhile leads to failure
    When I await data from a flow
    Then I should get an error when it gets dry and exhausted meanwhile