package sg.edu.ntu.garang_guni_backend.controllers;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.bind.MethodArgumentNotValidException;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    private static Item sampleItem;
    private static Item updatedItem;
    private static Item itemWithoutName;
    private static Item itemWithoutDescription;
    private static Item itemWithNothing;
    
    @BeforeAll
    static void setUp() {
        sampleItem = Item.builder()
                .itemName("Aluminium Cans")
                .itemDescription("It's a metal can.")
                .build();
        
        updatedItem = Item.builder()
                .itemName("Steel Cans")
                .itemDescription("It's STILL a metal can.")
                .build();

        itemWithoutName = Item.builder()
                .itemDescription("It's a metal can.")
                .build();

        itemWithoutDescription = Item.builder()
                .itemName("Aluminium Cans")
                .build();

        itemWithNothing = new Item();
    }

    @DisplayName("Create Item - Successful")
    @Test
    void createItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder request = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."));       
    }

    @DisplayName("Create Item - Missing Parameters")
    @Test
    void createItemWithMissingParametersTest() throws Exception {
        String newItemWithoutNameAsJson = objectMapper
                .writeValueAsString(itemWithoutName);
        String newItemWithoutDescriptionAsJson = objectMapper
                .writeValueAsString(itemWithoutDescription);
        String newItemWithNothingAsJson = objectMapper
                .writeValueAsString(itemWithNothing);
        
        RequestBuilder requestWithNoName = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithoutNameAsJson);
        RequestBuilder requestWithNoDescription = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithoutDescriptionAsJson);
        RequestBuilder requestWithNothing = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithNothingAsJson);
        
        mockMvc.perform(requestWithNoName)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(requestWithNoDescription)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(requestWithNothing)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }

    @DisplayName("Get Item By Id - Sucessful")
    @Test
    void getItemByIdTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."));
    }

    @DisplayName("Get Item By Id - Invalid Id")
    @Test
    void getItemByNonExistentIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder getRequest = MockMvcRequestBuilders.get(
                "/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Successful")
    @Test
    void updateItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Steel Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's STILL a metal can."));
    }

    @DisplayName("Update Item - Invalid Id")
    @Test
    void updateItemWithNonExistantIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Invalid Item")
    @Test
    void updateItemWithInvalidItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        String updatedItemWithoutNameAsJson = objectMapper
                .writeValueAsString(itemWithoutName);
        String updatedItemWithoutDescriptionAsJson = objectMapper
                .writeValueAsString(itemWithoutDescription);
        String updatedItemWithNothingAsJson = objectMapper
                .writeValueAsString(itemWithNothing);

        RequestBuilder putRequestWithNamelessItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithoutNameAsJson);
        RequestBuilder putRequestWithDescriptionlessItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithoutDescriptionAsJson);
        RequestBuilder putRequestWithBlankItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithNothingAsJson);

        mockMvc.perform(putRequestWithNamelessItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(putRequestWithDescriptionlessItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(putRequestWithBlankItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }

    @DisplayName("Delete Item - Successful")
    @Test
    void deleteItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNoContent());
        
        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);
        
        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Delete Item - Invalid Id")
    @Test
    void deleteNonExistentItemTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }
}
